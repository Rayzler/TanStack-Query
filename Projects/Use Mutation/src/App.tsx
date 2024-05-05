import "./App.css";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CommentWithId } from "./types.d";
import { getComments, postComment } from "./services/comments.ts";
import { FormEvent } from "react";
import { FormInput, FormTextArea } from "./components/Form.tsx";
import { Results } from "./components/Results.tsx";

export default function App() {
    const { data, isLoading, error } = useQuery<CommentWithId[]>({
        queryKey: ["comments"],
        queryFn: getComments
    });
    const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: postComment,
        onMutate: async (newComment) => {
            await queryClient.cancelQueries({
                queryKey: ["comments"]
            });

            const previousComments = queryClient.getQueryData(["comments"]);

            await queryClient.setQueryData(["comments"], (oldComments?: CommentWithId[]) => {
                const newCommentToAdd = structuredClone(newComment);
                newCommentToAdd.preview = true;

                if (oldComments == null) return [newCommentToAdd];
                return [...oldComments, newCommentToAdd];
            });

            return { previousComments }; // -----> context
        },
        onError: async (error, _, context) => {
            console.error("Error: ", error);
            queryClient.setQueryData(["comments"], context?.previousComments);
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["comments"]
            }); // -----> refetch
        }
    });
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isPending) return;

        const data = new FormData(event.currentTarget);
        const message = data.get("message")?.toString() ?? "";
        const title = data.get("title")?.toString() ?? "";

        if (message.trim() !== "" || title.trim() !== "") {
            mutate({ title, message });
        }
    };

    return (
        <main className="grid h-screen grid-cols-2">
            <div className="col-span-1 p-8 bg-white">

                {isLoading && <strong>Cargando...</strong>}
                {error != null && <strong>Algo ha ido mal</strong>}
                <Results data={data} />

            </div>
            <div className="col-span-1 p-8 bg-black">
                <form className={`${isPending ? "opacity-40" : ""} block max-w-xl px-4 m-auto`}
                      onSubmit={handleSubmit}>

                    <FormInput />
                    <FormTextArea />

                    <button
                        disabled={isPending}
                        type="submit"
                        className="mt-4 px-12 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm py-2.5 text-center mr-2 mb-2"
                    >
                        {isPending ? "Enviando comentario..." : "Enviar comentario"}
                    </button>
                </form>
            </div>
        </main>
    );
}
