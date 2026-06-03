# WebSockets — Orbit SignalR Hubs

## Conexión

### Autenticación

Ambos hubs requieren JWT. El backend acepta el token de **dos formas** en el middleware (`OnMessageReceived`):

1. **`Authorization: Bearer <token>`** — usado por negotiate, SSE y LongPolling (el cliente SignalR lo envía automáticamente en requests HTTP)
2. **`access_token` en query string** — usado por WebSocket (el browser no permite headers personalizados en WebSocket upgrade)

El orden de prioridad es: header `Authorization` primero → fallback a query string.

> Solo se aplica a rutas que comienzan con `/hubs/`.

### Transportes

SignalR intenta conexión en este orden:

| Transporte | Token | Requisitos |
|-----------|-------|------------|
| **WebSocket** | `?access_token=...` query string | `app.UseWebSockets()` en backend, proxy debe reenviar WebSocket |
| **ServerSentEvents (SSE)** | `Authorization: Bearer` header | Funciona detrás de cualquier proxy, recomendado para producción |
| **LongPolling** | `Authorization: Bearer` header | Último recurso, mayor latencia |

### Frontend — configuración recomendada para producción

```ts
import * as signalR from "@microsoft/signalr";

const connection = new HubConnectionBuilder()
  .withUrl("/hubs/chat", {
    accessTokenFactory: () => getToken(),
    transport: signalR.HttpTransportType.ServerSentEvents // forzar SSE
  })
  .withAutomaticReconnect()
  .build();
```

Sin especificar `transport`, SignalR probará WebSocket → SSE → LongPolling automáticamente.

### Conexión básica

```ts
const chatHub = new HubConnectionBuilder()
  .withUrl("/hubs/chat", { accessTokenFactory: () => token })
  .withAutomaticReconnect()
  .build();

const notifHub = new HubConnectionBuilder()
  .withUrl("/hubs/notifications", { accessTokenFactory: () => token })
  .withAutomaticReconnect()
  .build();
```

---

## `/hubs/chat` — Mensajería directa

### Cliente → Servidor (métodos invocables)

#### `JoinConversation(conversationId)`
Unirse al grupo de una conversación para recibir mensajes en tiempo real.

```ts
await connection.invoke("JoinConversation", "guid-conversation-id");
```

**Validación**: debe ser participante de la conversación; si no, lanza `HubException`.

---

#### `LeaveConversation(conversationId)`
Salirse del grupo al navegar fuera del chat.

```ts
await connection.invoke("LeaveConversation", "guid-conversation-id");
```

---

#### `SendMessage(conversationId, content)`
Envía un mensaje vía WebSocket. Persiste en DB y lo difunde a los otros participantes.

```ts
await connection.invoke("SendMessage", "guid-conversation-id", "Hola!");
```

**Validaciones**:
- Debe ser participante
- Contenido no vacío
- Máximo: `DomainConstants.MessageContentMaxLength`

---

#### `MarkAsRead(conversationId)`
Marca como leídos todos los mensajes no vistos de otros participantes. Dispara `MessageRead` al otro lado.

```ts
await connection.invoke("MarkAsRead", "guid-conversation-id");
```

---

#### `Typing(conversationId)`
Notifica a los otros participantes que el usuario está escribiendo.

```ts
await connection.invoke("Typing", "guid-conversation-id");
```

---

### Servidor → Cliente (eventos listen)

#### `ReceiveMessage`
Cuando otro participante envía un mensaje.

```ts
connection.on("ReceiveMessage", (data: ChatMessageBroadcast) => {
  // {
  //   id: string;
  //   conversationId: string;
  //   content: string | null;
  //   isSeen: boolean;
  //   isEdited: boolean;
  //   editedAt: string | null;
  //   createdAt: string;
  //   deletedAt: string | null;
  //   sender: {
  //     profileId: string;
  //     username: string;
  //     displayName: string;
  //     avatarUrl: string | null;
  //   };
  // }
});
```

---

#### `ReceiveOwnMessage`
Misma forma que `ReceiveMessage`, pero enviado **solo al caller** como confirmación de que el mensaje se persistió.

```ts
connection.on("ReceiveOwnMessage", (data: ChatMessageBroadcast) => {
  // misma forma que ReceiveMessage
});
```

---

#### `NewConversation`
Cuando se crea una nueva conversación DM. Se envía al **grupo profile de ambos participantes**.

```ts
connection.on("NewConversation", (data: ChatResponse) => {
  // {
  //   id: string;
  //   otherParticipant: { profileId, username, displayName, avatarUrl };
  //   lastMessage: MessageResponse | null;
  //   unreadCount: number;
  //   createdAt: string;
  //   isLastMessageFromCurrentUser: boolean;
  // }
});
```

> Si `lastMessage` es `null`, mostrar "Se el primero en enviar".

`MessageResponse`:

```ts
{
  id: string;
  conversationId: string;
  senderProfileId: string;
  content: string | null;
  isSeen: boolean;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  deletedAt: string | null;
  isFromCurrentUser: boolean;
}
```

---

#### `MessageRead`
Cuando el otro participante marca mensajes como leídos.

```ts
connection.on("MessageRead", (data: { conversationId: string; readByProfileId: string }) => {
  // actualizar UI: doble check / quitar badge
});
```

---

#### `UserTyping`
Cuando otro participante empieza a escribir.

```ts
connection.on("UserTyping", (data: { conversationId: string; profileId: string }) => {
  // mostrar "X está escribiendo..."
});
```

---

## `/hubs/notifications` — Notificaciones en tiempo real

Sin métodos invocables desde el cliente. El servidor pushea eventos cuando alguien interactúa con un post del usuario.

### Servidor → Cliente

#### `ReceiveNotification`

```ts
connection.on("ReceiveNotification", (data: NotificationResponse) => {
  // {
  //   id: string;
  //   type: "like" | "comment" | "repost" | "thread";
  //   actor: { profileId, username, displayName, avatarUrl, isFollowing };
  //   postId: string | null;
  //   postPreview: string | null;
  //   commentId: string | null;
  //   commentPreview: string | null;
  //   totalCount: number;
  //   isRead: boolean;
  //   createdAt: string;
  // }
});
```

**Grouping**: El servidor agrupa por `(profileId, type, postId)`. Si existe una notificación no leída con la misma clave, la **actualiza** (cambia actor, refresca totalCount) en lugar de crear duplicado.

**`totalCount` según tipo**:
| Tipo | Valor |
|------|-------|
| `like` | `Post.LikeCount` |
| `comment` | `Post.CommentCount` |
| `repost` | count de posts con `OriginalPostId == postId && IsRepost` |
| `thread` | count de posts con `OriginalPostId == postId && IsThread` |

---

## REST fallback para notificaciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/notifications?page=1&pageSize=20` | Lista paginada |
| `GET` | `/api/notifications/unread-count` | `{ count: number }` |
| `PATCH` | `/api/notifications/{id}/read` | Marcar una como leída |
| `PATCH` | `/api/notifications/read-all` | Marcar todas como leídas |

---

## Lifecycle recomendado

```ts
// 1. Conectar al iniciar sesión
const chatHub = new HubConnectionBuilder()
  .withUrl("/hubs/chat", {
    accessTokenFactory: () => getToken(),
    transport: signalR.HttpTransportType.ServerSentEvents // opcional: forzar SSE
  })
  .withAutomaticReconnect()
  .build();

const notifHub = new HubConnectionBuilder()
  .withUrl("/hubs/notifications", {
    accessTokenFactory: () => getToken(),
    transport: signalR.HttpTransportType.ServerSentEvents
  })
  .withAutomaticReconnect()
  .build();

// 2. Registrar listeners antes de start()
chatHub.on("ReceiveMessage", ...);
chatHub.on("ReceiveOwnMessage", ...);
chatHub.on("NewConversation", ...);
chatHub.on("MessageRead", ...);
chatHub.on("UserTyping", ...);
notifHub.on("ReceiveNotification", ...);

// 3. Iniciar
await chatHub.start();
await notifHub.start();

// 4. Unirse al grupo de una conversación al abrirla
await chatHub.invoke("JoinConversation", conversationId);

// 5. Salirse al cerrarla
await chatHub.invoke("LeaveConversation", conversationId);

// 6. Al cerrar sesión
await chatHub.stop();
await notifHub.stop();
```
