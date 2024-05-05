export interface Comment {
    title: string;
    message: string;
    preview?: boolean;
}

export interface CommentWithId extends Comment {
    id: string;
}