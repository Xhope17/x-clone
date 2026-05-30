export interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

// export interface PaginatedResult<T> {
//   items: T[];
//   totalCount: number;
//   page: number;
//   pageSize: number;
//   totalPages: number;
//   hasPreviousPage: boolean;
//   hasNextPage: boolean;
// }
