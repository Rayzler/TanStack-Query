# Práctica de TanStack Query

TanStack Query es una librería para manejar el estado de manera asíncrona en base a las respuestas de las peticiones a un
servidor.

<hr/>

### `QueryClientProvider`

Es el componente que provee el contexto de TanStack Query, toma como prop `client` que es una instancia de `QueryClient`
que después se puede acceder con el hook `useQueryClient`.

```jsx
const queryClient = new QueryClient();
<QueryClientProvider client={queryClient}>
    <App />
</QueryClientProvider>;
```

<hr/>

### `useQuery`

Es un hook que permite realizar peticiones a un servidor y manejar la respuesta como un estado.

Es como hacer un GET y guardar la respuesta en un estado.

Algunas propiedades que retorna son:

* `isLoading`: Indica si la petición está en curso.
* `isError`: Indica si hubo un error en la petición.
* `data`: Contiene la respuesta de la `queryFn`, es el estado.
* `refetch`: Permite volver a realizar la petición.

Algunas propiedades que se pueden configurar son:

* `queryKey`: Es el identificador de la petición.
* `queryFn`: Es la función que se ejecuta para realizar la petición.
* `refetchOnWindowFocus`: Indica si se deben volver a pedir los datos no actualizados al volver a enfocar la ventana.
* `staleTime`: Indica el tiempo que se considera que la respuesta está actualizada.
* `retry`: Indica la cantidad de veces que se debe reintentar la petición en caso de error.

```jsx
const { isLoading, isError, data, refetch } = useQuery <T>({
    queryKey: ["data"],
    queryFn: fetchData,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3
});
```

<hr/>

### `useInfiniteQuery`

Es como `useQuery` pero para peticiones paginadas, tiene las mismas propiedades y configuraciones que `useQuery`.

Algunas propiedades extra que retorna son:

* `fetchNextPage`: Permite pedir la siguiente página.
* `hasNextPage`: Indica si aun hay páginas por pedir.

Algunas propiedades extra que se pueden configurar son:

* `getNextPageParam`: Es una función que recibe la última página, que son los datos de la última petición, y retorna el
  parámetro para obtener la siguiente página.
* `initialPageParam`: Es el parámetro para obtener la primera página.
* `maxPages`: Indica la cantidad máxima de páginas que se pueden guardar en memoria, si se supera se eliminan las
  primeras.

```jsx
const { isLoading, isError, data, refetch, fetchNextPage, hasNextPage } = useInfiniteQuery<T>({
    queryKey: ["users"],
    queryFn: fetchUsers,
    getNextPageParam: (lastPage: T) => lastPage.nextPage,
    initialPageParam: 1,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    maxPages: 5
});
```

<hr/>

### `useQueryClient`

Es un hook que permite acceder al cliente de TanStack Query, el cual tiene métodos para manipular el estado de las
peticiones.

```jsx
const queryClient = useQueryClient();
```

* `setQueryData`: Permite modificar el estado de una petición, pero solo en memoria, no realiza una nueva petición.
  Recibe
  el identificador del estado a modificar y un callback que recibe el estado actual y retorna el nuevo estado.

```jsx
queryClient.setQueryData(["data"], (oldData) => {
    return { ...oldData, newData };
});
```

* `invalidateQueries`: Marca las peticiones con el identificador indicado como no actualizadas, por lo que TanStack Query
  volverá a pedir los datos.

```jsx
await queryClient.invalidateQueries({
    queryKey: ["data"]
});
```

* `cancelQueries`: Cancela las peticiones con el identificador indicado que se encuentren en curso.

```jsx
await queryClient.cancelQueries({
    queryKey: ["data"]
});
```

<hr/>

### `useMutation`

Es un hook que permite realizar peticiones de mutación a un servidor y manejar la respuesta como un estado.

Es como hacer un POST, PUT, DELETE, etc.

El estado en cache no se actualiza automáticamente, se debe hacer manualmente.

Algunas propiedades que retorna son:

* `mutate`: Manda a llamar la función de mutación `mutationFn`, recibe como argumento los datos a enviar.
* `isPending`: Indica si la petición está en curso.

Algunas propiedades que se pueden configurar son:

* `mutationFn`: Es la función que se ejecuta para realizar la petición.
* `onMutate`: Es una función que se ejecuta antes de realizar la petición, lo que retorne se pasa a `onError` y
  `onSettled` como contexto.
* `onSuccess`: Esta función se llama si la mutación es exitosa. Recibe tres argumentos: los datos devueltos por la
  mutación, los datos que se pasaron a la función `mutate`, y el contexto que se devolvió desde `onMutate`.
* `onError`: Esta función se llama si la mutación falla. Recibe tres argumentos: el error que ocurrió, los datos que se pasaron a la función `mutate`, y el contexto que se devolvió desde `onMutate`.
* `onSettled`: Esta función se llama después de que la mutación se haya completado, ya sea con éxito o con error. Recibe cuatro argumentos: los datos devueltos por la mutación, el error si ocurrió, los datos que se pasaron a la función `mutate`, y el contexto que se devolvió desde `onMutate`.

```jsx 
const { mutate, isPending } = useMutation({
    mutationFn: postData,
    onMutate: async (newData) => {
        // Cancelar las peticiones en curso para evitar inconsistencias
        await queryClient.cancelQueries(["data"]);
        // Guardar los datos actuales para poder regresarlos en caso de error
        const previousData = queryClient.getQueryData(["data"]);
        // Agregar los nuevos datos al cache mientras se realiza la petición
        queryClient.setQueryData(["data"], (oldData) => {
            return { ...oldData, newData };
        });
        // Retornar los datos actuales para poder regresarlos en caso de error
        return { previousData };
    },
    onSuccess: (data, newData, context) => {
        console.log("Success");
    },
    onError: (error, newData, context) => {
        // Regresar los datos anteriores en caso de error
        queryClient.setQueryData(["data"], context.previousData);
    },
    onSettled: async (data, error, newData, context) => {
        // Opcional: Volver a pedir los datos para asegurar que estén actualizados
        await queryClient.invalidateQueries({
            queryKey: ["data"]
        });
    }
});
```
