import { v4 as uuid } from "uuid";
import type { Comment } from "../types";

const masterKey = "YOUR_MASTER_KEY";
const apiKey = "YOUR_API_KEY";
const apiURL = "YOUR_API_URL";

export async function getComments() {
    const response = await fetch(apiURL, {
            headers: {
                "Content-Type": "application/json",
                "X-Access-Key": apiKey,
                "X-Master-Key": masterKey
            }
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch comments");
    }

    const json = await response.json();

    return json?.record;
}

export async function postComment(comment: Comment) {
    const comments = await getComments();
    const id = uuid();
    const newComment = { ...comment, id };
    const commentsToSave = [...comments, newComment];

    const response = await fetch(apiURL, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Access-Key": apiKey
        },
        body: JSON.stringify(commentsToSave)
    });

    if (!response.ok) {
        throw new Error("Failed to post comment");
    }

    return newComment;
}