import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type AddToPrintQueueInput = {
  /** ID mesh request для добавления в очередь печати */
  meshRequestId: Scalars['String']['input'];
  /** Дополнительные заметки для оператора принтера */
  notes?: InputMaybe<Scalars['String']['input']>;
};

export type FormatEntity = {
  __typename?: 'FormatEntity';
  createdAt: Scalars['DateTime']['output'];
  format: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  meshFormats?: Maybe<Array<MeshFormatEntity>>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

/** Тип генерации по странице фронта */
export enum FrontGenerationType {
  Gamedev = 'GAMEDEV',
  Print = 'PRINT',
  Standard = 'STANDARD'
}

export type GenerateMeshInput = {
  /** Список форматов моделей, которые нужно сгенерировать */
  modelFormats?: Array<Scalars['String']['input']>;
  /** ID исходного запроса, связанного с генерацией модели */
  previewId: Scalars['String']['input'];
  /** Индекс изображения в массиве исходных изображений */
  sourceImageIndex: Scalars['Int']['input'];
  token: Scalars['String']['input'];
};

export type GeneratePreviewInput = {
  censorChecking?: InputMaybe<Scalars['Boolean']['input']>;
  create_lod?: InputMaybe<Scalars['Int']['input']>;
  doQuadrification?: InputMaybe<Scalars['Boolean']['input']>;
  enableTextCensor?: InputMaybe<Scalars['Boolean']['input']>;
  enableVisualCensor?: InputMaybe<Scalars['Boolean']['input']>;
  /** Тип фронтовой генерации (standard, gamedev, 3dprint) */
  generationType: FrontGenerationType;
  /** Тип генерации (xr:3d_mesh, xr:image_to_3d, ...) */
  mode: MeshModels;
  /** Список форматов моделей, которые нужно сгенерировать */
  modelFormats?: Array<Scalars['String']['input']>;
  num_target_faces?: InputMaybe<Scalars['Int']['input']>;
  preview_num?: InputMaybe<Scalars['Int']['input']>;
  prompt: Scalars['String']['input'];
  sessionToken: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

/** Статусы генерации */
export enum GenerationStatus {
  Cancelled = 'CANCELLED',
  CancelledValidation = 'CANCELLED_VALIDATION',
  Pending = 'PENDING',
  Ready = 'READY',
  UnknownQueryId = 'UNKNOWN_QUERY_ID',
  Validation = 'VALIDATION'
}

export type ImageEntity = {
  __typename?: 'ImageEntity';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  meshRequests?: Maybe<Array<MeshRequestEntity>>;
  order: Scalars['Int']['output'];
  preview: PreviewEntity;
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  urlBackup?: Maybe<Scalars['String']['output']>;
};

export type MeshFormatEntity = {
  __typename?: 'MeshFormatEntity';
  createdAt: Scalars['DateTime']['output'];
  format: FormatEntity;
  id: Scalars['ID']['output'];
  meshRequest: MeshRequestEntity;
  meshRequestId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  urlBackup?: Maybe<Scalars['String']['output']>;
};

/** Модели для генерации меша */
export enum MeshModels {
  ImageTo_3D = 'IMAGE_TO_3D',
  ImageToGeometry = 'IMAGE_TO_GEOMETRY',
  MeshV1 = 'MESH_V1',
  PreviewV1 = 'PREVIEW_V1',
  TextToGeometry = 'TEXT_TO_GEOMETRY',
  Xr_3D = 'XR_3D'
}

export type MeshRequestEntity = {
  __typename?: 'MeshRequestEntity';
  censorChecking?: Maybe<Scalars['Boolean']['output']>;
  censored?: Maybe<Scalars['Boolean']['output']>;
  createLod?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  doQuadrification?: Maybe<Scalars['Boolean']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  generationMode: MeshModels;
  id: Scalars['ID']['output'];
  image?: Maybe<ImageEntity>;
  meshFormats?: Maybe<Array<MeshFormatEntity>>;
  modelName: Scalars['String']['output'];
  numTargetFaces?: Maybe<Scalars['Int']['output']>;
  previewPrompt?: Maybe<Scalars['String']['output']>;
  prompt?: Maybe<Scalars['String']['output']>;
  queryId: Scalars['String']['output'];
  readyEstimationSeconds?: Maybe<Scalars['Float']['output']>;
  readyEstimationTime: Scalars['DateTime']['output'];
  sessionToken?: Maybe<Scalars['String']['output']>;
  status: GenerationStatus;
  token?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Добавить модель в очередь печати */
  addToPrintQueue: PrintingQueueEntity;
  generateMesh: MeshRequestEntity;
  generatePreview: PreviewEntity;
  /** Удалить модель из очереди печати */
  removeFromPrintQueue: Scalars['Boolean']['output'];
  removeMeshById: Scalars['Boolean']['output'];
  removePreviewById: Scalars['Boolean']['output'];
  submitCensorComplaint: Scalars['Boolean']['output'];
  togglePreviewGalleryStatus: Scalars['Boolean']['output'];
  /** Обновить статус элемента очереди печати */
  updatePrintQueueStatus: PrintingQueueEntity;
};


export type MutationAddToPrintQueueArgs = {
  input: AddToPrintQueueInput;
};


export type MutationGenerateMeshArgs = {
  input: GenerateMeshInput;
};


export type MutationGeneratePreviewArgs = {
  input: GeneratePreviewInput;
};


export type MutationRemoveFromPrintQueueArgs = {
  id: Scalars['String']['input'];
};


export type MutationRemoveMeshByIdArgs = {
  all?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['String']['input'];
  sourceImageIndex: Scalars['Int']['input'];
};


export type MutationRemovePreviewByIdArgs = {
  id: Scalars['String']['input'];
};


export type MutationSubmitCensorComplaintArgs = {
  previewId: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationTogglePreviewGalleryStatusArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdatePrintQueueStatusArgs = {
  input: UpdatePrintQueueStatusInput;
};

export type PaginatedPrintingQueue = {
  __typename?: 'PaginatedPrintingQueue';
  data: Array<PrintingQueueEntity>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  total_pages: Scalars['Int']['output'];
};

export type PaginatedRequest = {
  __typename?: 'PaginatedRequest';
  data: Array<PreviewEntity>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  sessionToken?: Maybe<Scalars['String']['output']>;
  total: Scalars['Int']['output'];
  total_pages: Scalars['Int']['output'];
};

export type PaginationInput = {
  limit?: Scalars['Int']['input'];
  page?: Scalars['Int']['input'];
  status?: InputMaybe<GenerationStatus>;
};

export type PreviewEntity = {
  __typename?: 'PreviewEntity';
  censorChecking: Scalars['Boolean']['output'];
  censored?: Maybe<Scalars['Boolean']['output']>;
  createLod?: Maybe<Scalars['Int']['output']>;
  createdAt: Scalars['DateTime']['output'];
  doQuadrification?: Maybe<Scalars['Boolean']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  gallery: Scalars['Boolean']['output'];
  generationMode: MeshModels;
  generationType?: Maybe<FrontGenerationType>;
  id: Scalars['ID']['output'];
  images: Array<ImageEntity>;
  meshSourceOrder?: Maybe<Scalars['Int']['output']>;
  modelName: Scalars['String']['output'];
  numTargetFaces?: Maybe<Scalars['Int']['output']>;
  prompt: Scalars['String']['output'];
  queryId: Scalars['String']['output'];
  readyEstimationSeconds?: Maybe<Scalars['Float']['output']>;
  readyEstimationTime: Scalars['DateTime']['output'];
  sessionToken?: Maybe<Scalars['String']['output']>;
  sourceImageOrder?: Maybe<Scalars['Int']['output']>;
  sourceImageS3Key?: Maybe<Scalars['String']['output']>;
  status: GenerationStatus;
  token?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user: UserEntity;
};

export type PrintingQueueEntity = {
  __typename?: 'PrintingQueueEntity';
  addedAt: Scalars['DateTime']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  meshRequest: MeshRequestEntity;
  notes?: Maybe<Scalars['String']['output']>;
  status: PrintingQueueStatus;
  updatedAt: Scalars['DateTime']['output'];
  userId?: Maybe<Scalars['String']['output']>;
};

/** Статусы очереди печати */
export enum PrintingQueueStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Pending = 'PENDING',
  Printing = 'PRINTING'
}

export type Query = {
  __typename?: 'Query';
  getCensorCheckingMeshRequests: Array<MeshRequestEntity>;
  getCensorCheckingPreviews: Array<PreviewEntity>;
  getFavoriteModels: Array<PreviewEntity>;
  getGeneratedPreviews: PaginatedRequest;
  getMeshById: MeshRequestEntity;
  getPreviewById: PreviewEntity;
  /** Получить список моделей в очереди печати с пагинацией */
  getPrintingQueue: PaginatedPrintingQueue;
};


export type QueryGetCensorCheckingMeshRequestsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetCensorCheckingPreviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetFavoriteModelsArgs = {
  sessionToken: Scalars['String']['input'];
};


export type QueryGetGeneratedPreviewsArgs = {
  pagination: PaginationInput;
  sessionToken?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetMeshByIdArgs = {
  id: Scalars['String']['input'];
  sourceImageIndex?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGetPreviewByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetPrintingQueueArgs = {
  pagination: PaginationInput;
};

export type Subscription = {
  __typename?: 'Subscription';
  meshStatusChanged?: Maybe<MeshRequestEntity>;
  previewStatusChanged?: Maybe<PreviewEntity>;
};


export type SubscriptionMeshStatusChangedArgs = {
  id: Scalars['String']['input'];
};


export type SubscriptionPreviewStatusChangedArgs = {
  id: Scalars['String']['input'];
};

export type UpdatePrintQueueStatusInput = {
  /** ID элемента очереди печати */
  id: Scalars['String']['input'];
  /** Новый статус элемента очереди */
  status: PrintingQueueStatus;
};

export type UserEntity = {
  __typename?: 'UserEntity';
  createdAt: Scalars['DateTime']['output'];
  generationRequests?: Maybe<Array<PreviewEntity>>;
  id: Scalars['ID']['output'];
  login: Scalars['String']['output'];
  role: UserRole;
  updatedAt: Scalars['DateTime']['output'];
  username: Scalars['String']['output'];
};

/** Роли для пользователей */
export enum UserRole {
  Admin = 'ADMIN',
  SuperAdmin = 'SUPER_ADMIN',
  User = 'USER'
}

export type PreviewEntityFragmentFragment = { __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> };

export type MeshRequestEntityFragmentFragment = { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, generationMode: MeshModels, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, createLod?: number | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null };

export type MeshRequestWithPreviewFragmentFragment = { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, generationMode: MeshModels, createLod?: number | null, image?: { __typename?: 'ImageEntity', id: string, url: string, order: number, preview: { __typename?: 'PreviewEntity', id: string, prompt: string, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number }> } } | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null };

export type PrintingQueueEntityFragmentFragment = { __typename?: 'PrintingQueueEntity', id: string, userId?: string | null, addedAt: any, status: PrintingQueueStatus, notes?: string | null, meshRequest: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, generationMode: MeshModels, createLod?: number | null, image?: { __typename?: 'ImageEntity', id: string, url: string, order: number, preview: { __typename?: 'PreviewEntity', id: string, prompt: string, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number }> } } | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } };

export type GeneratePreviewMutationVariables = Exact<{
  input: GeneratePreviewInput;
}>;


export type GeneratePreviewMutation = { __typename?: 'Mutation', generatePreview: { __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> } };

export type GenerateMeshMutationVariables = Exact<{
  input: GenerateMeshInput;
}>;


export type GenerateMeshMutation = { __typename?: 'Mutation', generateMesh: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, generationMode: MeshModels, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, createLod?: number | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } };

export type RemoveMeshByIdMutationVariables = Exact<{
  id: Scalars['String']['input'];
  sourceImageIndex: Scalars['Int']['input'];
  all?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type RemoveMeshByIdMutation = { __typename?: 'Mutation', removeMeshById: boolean };

export type AddToPrintQueueMutationVariables = Exact<{
  input: AddToPrintQueueInput;
}>;


export type AddToPrintQueueMutation = { __typename?: 'Mutation', addToPrintQueue: { __typename?: 'PrintingQueueEntity', id: string, userId?: string | null, addedAt: any, status: PrintingQueueStatus, notes?: string | null, meshRequest: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, generationMode: MeshModels, createLod?: number | null, image?: { __typename?: 'ImageEntity', id: string, url: string, order: number, preview: { __typename?: 'PreviewEntity', id: string, prompt: string, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number }> } } | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } } };

export type RemoveFromPrintQueueMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RemoveFromPrintQueueMutation = { __typename?: 'Mutation', removeFromPrintQueue: boolean };

export type UpdatePrintQueueStatusMutationVariables = Exact<{
  input: UpdatePrintQueueStatusInput;
}>;


export type UpdatePrintQueueStatusMutation = { __typename?: 'Mutation', updatePrintQueueStatus: { __typename?: 'PrintingQueueEntity', id: string, userId?: string | null, addedAt: any, status: PrintingQueueStatus, notes?: string | null, meshRequest: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, generationMode: MeshModels, createLod?: number | null, image?: { __typename?: 'ImageEntity', id: string, url: string, order: number, preview: { __typename?: 'PreviewEntity', id: string, prompt: string, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number }> } } | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } } };

export type RemovePreviewByIdMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type RemovePreviewByIdMutation = { __typename?: 'Mutation', removePreviewById: boolean };

export type SubmitCensorComplaintMutationVariables = Exact<{
  previewId: Scalars['String']['input'];
  sessionToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type SubmitCensorComplaintMutation = { __typename?: 'Mutation', submitCensorComplaint: boolean };

export type GetGeneratedPreviewsQueryVariables = Exact<{
  pagination: PaginationInput;
  sessionToken?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetGeneratedPreviewsQuery = { __typename?: 'Query', getGeneratedPreviews: { __typename?: 'PaginatedRequest', limit: number, page: number, total: number, total_pages: number, data: Array<{ __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> }> } };

export type GetPreviewByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetPreviewByIdQuery = { __typename?: 'Query', getPreviewById: { __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> } };

export type GetMeshByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
  sourceImageIndex?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMeshByIdQuery = { __typename?: 'Query', getMeshById: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, generationMode: MeshModels, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, createLod?: number | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } };

export type GetFavoriteModelsQueryVariables = Exact<{
  sessionToken: Scalars['String']['input'];
}>;


export type GetFavoriteModelsQuery = { __typename?: 'Query', getFavoriteModels: Array<{ __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> }> };

export type GetPrintingQueueQueryVariables = Exact<{
  pagination: PaginationInput;
}>;


export type GetPrintingQueueQuery = { __typename?: 'Query', getPrintingQueue: { __typename?: 'PaginatedPrintingQueue', limit: number, page: number, total: number, total_pages: number, data: Array<{ __typename?: 'PrintingQueueEntity', id: string, userId?: string | null, addedAt: any, status: PrintingQueueStatus, notes?: string | null, meshRequest: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, generationMode: MeshModels, createLod?: number | null, image?: { __typename?: 'ImageEntity', id: string, url: string, order: number, preview: { __typename?: 'PreviewEntity', id: string, prompt: string, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number }> } } | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } }> } };

export type GetCensorCheckingPreviewsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetCensorCheckingPreviewsQuery = { __typename?: 'Query', getCensorCheckingPreviews: Array<{ __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> }> };

export type OnMeshStatusChangedSubscriptionVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OnMeshStatusChangedSubscription = { __typename?: 'Subscription', meshStatusChanged?: { __typename?: 'MeshRequestEntity', id: string, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, errorMessage?: string | null, censored?: boolean | null, generationMode: MeshModels, token?: string | null, previewPrompt?: string | null, doQuadrification?: boolean | null, numTargetFaces?: number | null, createLod?: number | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null } | null };

export type OnPreviewStatusChangedSubscriptionVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type OnPreviewStatusChangedSubscription = { __typename?: 'Subscription', previewStatusChanged?: { __typename?: 'PreviewEntity', id: string, updatedAt: any, modelName: string, queryId: string, status: GenerationStatus, readyEstimationTime: any, readyEstimationSeconds?: number | null, prompt: string, sessionToken?: string | null, gallery: boolean, censorChecking: boolean, censored?: boolean | null, errorMessage?: string | null, sourceImageOrder?: number | null, meshSourceOrder?: number | null, numTargetFaces?: number | null, doQuadrification?: boolean | null, generationMode: MeshModels, generationType?: FrontGenerationType | null, createLod?: number | null, images: Array<{ __typename?: 'ImageEntity', id: string, url: string, order: number, meshRequests?: Array<{ __typename?: 'MeshRequestEntity', id: string, status: GenerationStatus, readyEstimationSeconds?: number | null, censorChecking?: boolean | null, prompt?: string | null, meshFormats?: Array<{ __typename?: 'MeshFormatEntity', id: string, url: string, format: { __typename?: 'FormatEntity', id: string, name: string } }> | null }> | null }> } | null };

export const PreviewEntityFragmentFragmentDoc = gql`
    fragment PreviewEntityFragment on PreviewEntity {
  id
  updatedAt
  modelName
  queryId
  status
  readyEstimationTime
  readyEstimationSeconds
  prompt
  sessionToken
  gallery
  censorChecking
  censored
  errorMessage
  sourceImageOrder
  meshSourceOrder
  numTargetFaces
  doQuadrification
  generationMode
  generationType
  createLod
  images {
    id
    url
    order
    meshRequests {
      id
      status
      readyEstimationSeconds
      censorChecking
      prompt
      meshFormats {
        id
        url
        format {
          id
          name
        }
      }
    }
  }
}
    `;
export const MeshRequestEntityFragmentFragmentDoc = gql`
    fragment MeshRequestEntityFragment on MeshRequestEntity {
  id
  modelName
  queryId
  status
  readyEstimationTime
  readyEstimationSeconds
  errorMessage
  censored
  generationMode
  token
  previewPrompt
  doQuadrification
  numTargetFaces
  createLod
  meshFormats {
    id
    format {
      id
      name
    }
    url
  }
}
    `;
export const MeshRequestWithPreviewFragmentFragmentDoc = gql`
    fragment MeshRequestWithPreviewFragment on MeshRequestEntity {
  id
  modelName
  queryId
  status
  readyEstimationTime
  readyEstimationSeconds
  errorMessage
  censored
  token
  previewPrompt
  doQuadrification
  numTargetFaces
  generationMode
  createLod
  image {
    id
    url
    order
    preview {
      id
      prompt
      images {
        id
        url
        order
      }
    }
  }
  meshFormats {
    id
    format {
      id
      name
    }
    url
  }
}
    `;
export const PrintingQueueEntityFragmentFragmentDoc = gql`
    fragment PrintingQueueEntityFragment on PrintingQueueEntity {
  id
  userId
  addedAt
  status
  notes
  meshRequest {
    ...MeshRequestWithPreviewFragment
  }
}
    ${MeshRequestWithPreviewFragmentFragmentDoc}`;
export const GeneratePreviewDocument = gql`
    mutation GeneratePreview($input: GeneratePreviewInput!) {
  generatePreview(input: $input) {
    ...PreviewEntityFragment
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;
export type GeneratePreviewMutationFn = Apollo.MutationFunction<GeneratePreviewMutation, GeneratePreviewMutationVariables>;

/**
 * __useGeneratePreviewMutation__
 *
 * To run a mutation, you first call `useGeneratePreviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGeneratePreviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generatePreviewMutation, { data, loading, error }] = useGeneratePreviewMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGeneratePreviewMutation(baseOptions?: Apollo.MutationHookOptions<GeneratePreviewMutation, GeneratePreviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GeneratePreviewMutation, GeneratePreviewMutationVariables>(GeneratePreviewDocument, options);
      }
export type GeneratePreviewMutationHookResult = ReturnType<typeof useGeneratePreviewMutation>;
export type GeneratePreviewMutationResult = Apollo.MutationResult<GeneratePreviewMutation>;
export type GeneratePreviewMutationOptions = Apollo.BaseMutationOptions<GeneratePreviewMutation, GeneratePreviewMutationVariables>;
export const GenerateMeshDocument = gql`
    mutation GenerateMesh($input: GenerateMeshInput!) {
  generateMesh(input: $input) {
    ...MeshRequestEntityFragment
  }
}
    ${MeshRequestEntityFragmentFragmentDoc}`;
export type GenerateMeshMutationFn = Apollo.MutationFunction<GenerateMeshMutation, GenerateMeshMutationVariables>;

/**
 * __useGenerateMeshMutation__
 *
 * To run a mutation, you first call `useGenerateMeshMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateMeshMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateMeshMutation, { data, loading, error }] = useGenerateMeshMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateMeshMutation(baseOptions?: Apollo.MutationHookOptions<GenerateMeshMutation, GenerateMeshMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateMeshMutation, GenerateMeshMutationVariables>(GenerateMeshDocument, options);
      }
export type GenerateMeshMutationHookResult = ReturnType<typeof useGenerateMeshMutation>;
export type GenerateMeshMutationResult = Apollo.MutationResult<GenerateMeshMutation>;
export type GenerateMeshMutationOptions = Apollo.BaseMutationOptions<GenerateMeshMutation, GenerateMeshMutationVariables>;
export const RemoveMeshByIdDocument = gql`
    mutation RemoveMeshById($id: String!, $sourceImageIndex: Int!, $all: Boolean) {
  removeMeshById(id: $id, sourceImageIndex: $sourceImageIndex, all: $all)
}
    `;
export type RemoveMeshByIdMutationFn = Apollo.MutationFunction<RemoveMeshByIdMutation, RemoveMeshByIdMutationVariables>;

/**
 * __useRemoveMeshByIdMutation__
 *
 * To run a mutation, you first call `useRemoveMeshByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveMeshByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeMeshByIdMutation, { data, loading, error }] = useRemoveMeshByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      sourceImageIndex: // value for 'sourceImageIndex'
 *      all: // value for 'all'
 *   },
 * });
 */
export function useRemoveMeshByIdMutation(baseOptions?: Apollo.MutationHookOptions<RemoveMeshByIdMutation, RemoveMeshByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveMeshByIdMutation, RemoveMeshByIdMutationVariables>(RemoveMeshByIdDocument, options);
      }
export type RemoveMeshByIdMutationHookResult = ReturnType<typeof useRemoveMeshByIdMutation>;
export type RemoveMeshByIdMutationResult = Apollo.MutationResult<RemoveMeshByIdMutation>;
export type RemoveMeshByIdMutationOptions = Apollo.BaseMutationOptions<RemoveMeshByIdMutation, RemoveMeshByIdMutationVariables>;
export const AddToPrintQueueDocument = gql`
    mutation AddToPrintQueue($input: AddToPrintQueueInput!) {
  addToPrintQueue(input: $input) {
    ...PrintingQueueEntityFragment
  }
}
    ${PrintingQueueEntityFragmentFragmentDoc}`;
export type AddToPrintQueueMutationFn = Apollo.MutationFunction<AddToPrintQueueMutation, AddToPrintQueueMutationVariables>;

/**
 * __useAddToPrintQueueMutation__
 *
 * To run a mutation, you first call `useAddToPrintQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToPrintQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToPrintQueueMutation, { data, loading, error }] = useAddToPrintQueueMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddToPrintQueueMutation(baseOptions?: Apollo.MutationHookOptions<AddToPrintQueueMutation, AddToPrintQueueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddToPrintQueueMutation, AddToPrintQueueMutationVariables>(AddToPrintQueueDocument, options);
      }
export type AddToPrintQueueMutationHookResult = ReturnType<typeof useAddToPrintQueueMutation>;
export type AddToPrintQueueMutationResult = Apollo.MutationResult<AddToPrintQueueMutation>;
export type AddToPrintQueueMutationOptions = Apollo.BaseMutationOptions<AddToPrintQueueMutation, AddToPrintQueueMutationVariables>;
export const RemoveFromPrintQueueDocument = gql`
    mutation RemoveFromPrintQueue($id: String!) {
  removeFromPrintQueue(id: $id)
}
    `;
export type RemoveFromPrintQueueMutationFn = Apollo.MutationFunction<RemoveFromPrintQueueMutation, RemoveFromPrintQueueMutationVariables>;

/**
 * __useRemoveFromPrintQueueMutation__
 *
 * To run a mutation, you first call `useRemoveFromPrintQueueMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFromPrintQueueMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFromPrintQueueMutation, { data, loading, error }] = useRemoveFromPrintQueueMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveFromPrintQueueMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFromPrintQueueMutation, RemoveFromPrintQueueMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFromPrintQueueMutation, RemoveFromPrintQueueMutationVariables>(RemoveFromPrintQueueDocument, options);
      }
export type RemoveFromPrintQueueMutationHookResult = ReturnType<typeof useRemoveFromPrintQueueMutation>;
export type RemoveFromPrintQueueMutationResult = Apollo.MutationResult<RemoveFromPrintQueueMutation>;
export type RemoveFromPrintQueueMutationOptions = Apollo.BaseMutationOptions<RemoveFromPrintQueueMutation, RemoveFromPrintQueueMutationVariables>;
export const UpdatePrintQueueStatusDocument = gql`
    mutation UpdatePrintQueueStatus($input: UpdatePrintQueueStatusInput!) {
  updatePrintQueueStatus(input: $input) {
    ...PrintingQueueEntityFragment
  }
}
    ${PrintingQueueEntityFragmentFragmentDoc}`;
export type UpdatePrintQueueStatusMutationFn = Apollo.MutationFunction<UpdatePrintQueueStatusMutation, UpdatePrintQueueStatusMutationVariables>;

/**
 * __useUpdatePrintQueueStatusMutation__
 *
 * To run a mutation, you first call `useUpdatePrintQueueStatusMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePrintQueueStatusMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePrintQueueStatusMutation, { data, loading, error }] = useUpdatePrintQueueStatusMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePrintQueueStatusMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePrintQueueStatusMutation, UpdatePrintQueueStatusMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePrintQueueStatusMutation, UpdatePrintQueueStatusMutationVariables>(UpdatePrintQueueStatusDocument, options);
      }
export type UpdatePrintQueueStatusMutationHookResult = ReturnType<typeof useUpdatePrintQueueStatusMutation>;
export type UpdatePrintQueueStatusMutationResult = Apollo.MutationResult<UpdatePrintQueueStatusMutation>;
export type UpdatePrintQueueStatusMutationOptions = Apollo.BaseMutationOptions<UpdatePrintQueueStatusMutation, UpdatePrintQueueStatusMutationVariables>;
export const RemovePreviewByIdDocument = gql`
    mutation RemovePreviewById($id: String!) {
  removePreviewById(id: $id)
}
    `;
export type RemovePreviewByIdMutationFn = Apollo.MutationFunction<RemovePreviewByIdMutation, RemovePreviewByIdMutationVariables>;

/**
 * __useRemovePreviewByIdMutation__
 *
 * To run a mutation, you first call `useRemovePreviewByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemovePreviewByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removePreviewByIdMutation, { data, loading, error }] = useRemovePreviewByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemovePreviewByIdMutation(baseOptions?: Apollo.MutationHookOptions<RemovePreviewByIdMutation, RemovePreviewByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemovePreviewByIdMutation, RemovePreviewByIdMutationVariables>(RemovePreviewByIdDocument, options);
      }
export type RemovePreviewByIdMutationHookResult = ReturnType<typeof useRemovePreviewByIdMutation>;
export type RemovePreviewByIdMutationResult = Apollo.MutationResult<RemovePreviewByIdMutation>;
export type RemovePreviewByIdMutationOptions = Apollo.BaseMutationOptions<RemovePreviewByIdMutation, RemovePreviewByIdMutationVariables>;
export const SubmitCensorComplaintDocument = gql`
    mutation SubmitCensorComplaint($previewId: String!, $sessionToken: String) {
  submitCensorComplaint(previewId: $previewId, sessionToken: $sessionToken)
}
    `;
export type SubmitCensorComplaintMutationFn = Apollo.MutationFunction<SubmitCensorComplaintMutation, SubmitCensorComplaintMutationVariables>;

/**
 * __useSubmitCensorComplaintMutation__
 *
 * To run a mutation, you first call `useSubmitCensorComplaintMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitCensorComplaintMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitCensorComplaintMutation, { data, loading, error }] = useSubmitCensorComplaintMutation({
 *   variables: {
 *      previewId: // value for 'previewId'
 *      sessionToken: // value for 'sessionToken'
 *   },
 * });
 */
export function useSubmitCensorComplaintMutation(baseOptions?: Apollo.MutationHookOptions<SubmitCensorComplaintMutation, SubmitCensorComplaintMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitCensorComplaintMutation, SubmitCensorComplaintMutationVariables>(SubmitCensorComplaintDocument, options);
      }
export type SubmitCensorComplaintMutationHookResult = ReturnType<typeof useSubmitCensorComplaintMutation>;
export type SubmitCensorComplaintMutationResult = Apollo.MutationResult<SubmitCensorComplaintMutation>;
export type SubmitCensorComplaintMutationOptions = Apollo.BaseMutationOptions<SubmitCensorComplaintMutation, SubmitCensorComplaintMutationVariables>;
export const GetGeneratedPreviewsDocument = gql`
    query GetGeneratedPreviews($pagination: PaginationInput!, $sessionToken: String) {
  getGeneratedPreviews(pagination: $pagination, sessionToken: $sessionToken) {
    data {
      ...PreviewEntityFragment
    }
    limit
    page
    total
    total_pages
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;

/**
 * __useGetGeneratedPreviewsQuery__
 *
 * To run a query within a React component, call `useGetGeneratedPreviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGeneratedPreviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGeneratedPreviewsQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *      sessionToken: // value for 'sessionToken'
 *   },
 * });
 */
export function useGetGeneratedPreviewsQuery(baseOptions: Apollo.QueryHookOptions<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables> & ({ variables: GetGeneratedPreviewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>(GetGeneratedPreviewsDocument, options);
      }
export function useGetGeneratedPreviewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>(GetGeneratedPreviewsDocument, options);
        }
export function useGetGeneratedPreviewsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>(GetGeneratedPreviewsDocument, options);
        }
export type GetGeneratedPreviewsQueryHookResult = ReturnType<typeof useGetGeneratedPreviewsQuery>;
export type GetGeneratedPreviewsLazyQueryHookResult = ReturnType<typeof useGetGeneratedPreviewsLazyQuery>;
export type GetGeneratedPreviewsSuspenseQueryHookResult = ReturnType<typeof useGetGeneratedPreviewsSuspenseQuery>;
export type GetGeneratedPreviewsQueryResult = Apollo.QueryResult<GetGeneratedPreviewsQuery, GetGeneratedPreviewsQueryVariables>;
export const GetPreviewByIdDocument = gql`
    query GetPreviewById($id: String!) {
  getPreviewById(id: $id) {
    ...PreviewEntityFragment
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;

/**
 * __useGetPreviewByIdQuery__
 *
 * To run a query within a React component, call `useGetPreviewByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPreviewByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPreviewByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetPreviewByIdQuery(baseOptions: Apollo.QueryHookOptions<GetPreviewByIdQuery, GetPreviewByIdQueryVariables> & ({ variables: GetPreviewByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>(GetPreviewByIdDocument, options);
      }
export function useGetPreviewByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>(GetPreviewByIdDocument, options);
        }
export function useGetPreviewByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>(GetPreviewByIdDocument, options);
        }
export type GetPreviewByIdQueryHookResult = ReturnType<typeof useGetPreviewByIdQuery>;
export type GetPreviewByIdLazyQueryHookResult = ReturnType<typeof useGetPreviewByIdLazyQuery>;
export type GetPreviewByIdSuspenseQueryHookResult = ReturnType<typeof useGetPreviewByIdSuspenseQuery>;
export type GetPreviewByIdQueryResult = Apollo.QueryResult<GetPreviewByIdQuery, GetPreviewByIdQueryVariables>;
export const GetMeshByIdDocument = gql`
    query GetMeshById($id: String!, $sourceImageIndex: Int) {
  getMeshById(id: $id, sourceImageIndex: $sourceImageIndex) {
    ...MeshRequestEntityFragment
  }
}
    ${MeshRequestEntityFragmentFragmentDoc}`;

/**
 * __useGetMeshByIdQuery__
 *
 * To run a query within a React component, call `useGetMeshByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMeshByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMeshByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *      sourceImageIndex: // value for 'sourceImageIndex'
 *   },
 * });
 */
export function useGetMeshByIdQuery(baseOptions: Apollo.QueryHookOptions<GetMeshByIdQuery, GetMeshByIdQueryVariables> & ({ variables: GetMeshByIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMeshByIdQuery, GetMeshByIdQueryVariables>(GetMeshByIdDocument, options);
      }
export function useGetMeshByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMeshByIdQuery, GetMeshByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMeshByIdQuery, GetMeshByIdQueryVariables>(GetMeshByIdDocument, options);
        }
export function useGetMeshByIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetMeshByIdQuery, GetMeshByIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetMeshByIdQuery, GetMeshByIdQueryVariables>(GetMeshByIdDocument, options);
        }
export type GetMeshByIdQueryHookResult = ReturnType<typeof useGetMeshByIdQuery>;
export type GetMeshByIdLazyQueryHookResult = ReturnType<typeof useGetMeshByIdLazyQuery>;
export type GetMeshByIdSuspenseQueryHookResult = ReturnType<typeof useGetMeshByIdSuspenseQuery>;
export type GetMeshByIdQueryResult = Apollo.QueryResult<GetMeshByIdQuery, GetMeshByIdQueryVariables>;
export const GetFavoriteModelsDocument = gql`
    query GetFavoriteModels($sessionToken: String!) {
  getFavoriteModels(sessionToken: $sessionToken) {
    ...PreviewEntityFragment
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;

/**
 * __useGetFavoriteModelsQuery__
 *
 * To run a query within a React component, call `useGetFavoriteModelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFavoriteModelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFavoriteModelsQuery({
 *   variables: {
 *      sessionToken: // value for 'sessionToken'
 *   },
 * });
 */
export function useGetFavoriteModelsQuery(baseOptions: Apollo.QueryHookOptions<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables> & ({ variables: GetFavoriteModelsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>(GetFavoriteModelsDocument, options);
      }
export function useGetFavoriteModelsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>(GetFavoriteModelsDocument, options);
        }
export function useGetFavoriteModelsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>(GetFavoriteModelsDocument, options);
        }
export type GetFavoriteModelsQueryHookResult = ReturnType<typeof useGetFavoriteModelsQuery>;
export type GetFavoriteModelsLazyQueryHookResult = ReturnType<typeof useGetFavoriteModelsLazyQuery>;
export type GetFavoriteModelsSuspenseQueryHookResult = ReturnType<typeof useGetFavoriteModelsSuspenseQuery>;
export type GetFavoriteModelsQueryResult = Apollo.QueryResult<GetFavoriteModelsQuery, GetFavoriteModelsQueryVariables>;
export const GetPrintingQueueDocument = gql`
    query GetPrintingQueue($pagination: PaginationInput!) {
  getPrintingQueue(pagination: $pagination) {
    data {
      ...PrintingQueueEntityFragment
    }
    limit
    page
    total
    total_pages
  }
}
    ${PrintingQueueEntityFragmentFragmentDoc}`;

/**
 * __useGetPrintingQueueQuery__
 *
 * To run a query within a React component, call `useGetPrintingQueueQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPrintingQueueQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPrintingQueueQuery({
 *   variables: {
 *      pagination: // value for 'pagination'
 *   },
 * });
 */
export function useGetPrintingQueueQuery(baseOptions: Apollo.QueryHookOptions<GetPrintingQueueQuery, GetPrintingQueueQueryVariables> & ({ variables: GetPrintingQueueQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>(GetPrintingQueueDocument, options);
      }
export function useGetPrintingQueueLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>(GetPrintingQueueDocument, options);
        }
export function useGetPrintingQueueSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>(GetPrintingQueueDocument, options);
        }
export type GetPrintingQueueQueryHookResult = ReturnType<typeof useGetPrintingQueueQuery>;
export type GetPrintingQueueLazyQueryHookResult = ReturnType<typeof useGetPrintingQueueLazyQuery>;
export type GetPrintingQueueSuspenseQueryHookResult = ReturnType<typeof useGetPrintingQueueSuspenseQuery>;
export type GetPrintingQueueQueryResult = Apollo.QueryResult<GetPrintingQueueQuery, GetPrintingQueueQueryVariables>;
export const GetCensorCheckingPreviewsDocument = gql`
    query GetCensorCheckingPreviews($limit: Int) {
  getCensorCheckingPreviews(limit: $limit) {
    ...PreviewEntityFragment
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;

/**
 * __useGetCensorCheckingPreviewsQuery__
 *
 * To run a query within a React component, call `useGetCensorCheckingPreviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCensorCheckingPreviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCensorCheckingPreviewsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useGetCensorCheckingPreviewsQuery(baseOptions?: Apollo.QueryHookOptions<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>(GetCensorCheckingPreviewsDocument, options);
      }
export function useGetCensorCheckingPreviewsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>(GetCensorCheckingPreviewsDocument, options);
        }
export function useGetCensorCheckingPreviewsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>(GetCensorCheckingPreviewsDocument, options);
        }
export type GetCensorCheckingPreviewsQueryHookResult = ReturnType<typeof useGetCensorCheckingPreviewsQuery>;
export type GetCensorCheckingPreviewsLazyQueryHookResult = ReturnType<typeof useGetCensorCheckingPreviewsLazyQuery>;
export type GetCensorCheckingPreviewsSuspenseQueryHookResult = ReturnType<typeof useGetCensorCheckingPreviewsSuspenseQuery>;
export type GetCensorCheckingPreviewsQueryResult = Apollo.QueryResult<GetCensorCheckingPreviewsQuery, GetCensorCheckingPreviewsQueryVariables>;
export const OnMeshStatusChangedDocument = gql`
    subscription OnMeshStatusChanged($id: String!) {
  meshStatusChanged(id: $id) {
    ...MeshRequestEntityFragment
  }
}
    ${MeshRequestEntityFragmentFragmentDoc}`;

/**
 * __useOnMeshStatusChangedSubscription__
 *
 * To run a query within a React component, call `useOnMeshStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnMeshStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnMeshStatusChangedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOnMeshStatusChangedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnMeshStatusChangedSubscription, OnMeshStatusChangedSubscriptionVariables> & ({ variables: OnMeshStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnMeshStatusChangedSubscription, OnMeshStatusChangedSubscriptionVariables>(OnMeshStatusChangedDocument, options);
      }
export type OnMeshStatusChangedSubscriptionHookResult = ReturnType<typeof useOnMeshStatusChangedSubscription>;
export type OnMeshStatusChangedSubscriptionResult = Apollo.SubscriptionResult<OnMeshStatusChangedSubscription>;
export const OnPreviewStatusChangedDocument = gql`
    subscription OnPreviewStatusChanged($id: String!) {
  previewStatusChanged(id: $id) {
    ...PreviewEntityFragment
  }
}
    ${PreviewEntityFragmentFragmentDoc}`;

/**
 * __useOnPreviewStatusChangedSubscription__
 *
 * To run a query within a React component, call `useOnPreviewStatusChangedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnPreviewStatusChangedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnPreviewStatusChangedSubscription({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOnPreviewStatusChangedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnPreviewStatusChangedSubscription, OnPreviewStatusChangedSubscriptionVariables> & ({ variables: OnPreviewStatusChangedSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnPreviewStatusChangedSubscription, OnPreviewStatusChangedSubscriptionVariables>(OnPreviewStatusChangedDocument, options);
      }
export type OnPreviewStatusChangedSubscriptionHookResult = ReturnType<typeof useOnPreviewStatusChangedSubscription>;
export type OnPreviewStatusChangedSubscriptionResult = Apollo.SubscriptionResult<OnPreviewStatusChangedSubscription>;