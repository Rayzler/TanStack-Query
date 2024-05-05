import { useMemo, useState } from "react";
import "./App.css";
import { UsersList } from "./components/UsersList";
import { SortBy, type User } from "./types.d";
import useUsers from "./hooks/useUsers";
import Results from "./components/Results";
import { useQueryClient } from "@tanstack/react-query";
import { cloneDeep } from "lodash";

function App() {
    const { users, refetch, isError, isLoading, fetchNextPage, hasNextPage, removeUser } = useUsers();

    const [showColors, setShowColors] = useState(false);
    const [sorting, setSorting] = useState<SortBy>(SortBy.NONE);
    const [filterCountry, setFilterCountry] = useState<string | null>(null);

    const toggleColors = () => {
        setShowColors(!showColors);
    };

    const toggleSortByCountry = () => {
        const newSortingValue = sorting === SortBy.NONE ? SortBy.COUNTRY : SortBy.NONE;
        setSorting(newSortingValue);
    };

    const handleReset = () => {
        void refetch();
    };

    const handleDelete = (email: string) => {
        removeUser(email);
    };

    const handleChangeSort = (sort: SortBy) => {
        setSorting(sort);
    };


    const filteredUsers = useMemo(() => {
        return filterCountry != null && filterCountry.length > 0
            ? users.filter((user) => {
                return user.location.country.toLowerCase().includes(filterCountry.toLowerCase());
            })
            : users;
    }, [users, filterCountry]);

    const sortedUsers = useMemo(() => {
        if (sorting === SortBy.NONE) return filteredUsers;

        const compareProperties: Record<string, (user: User) => any> = {
            [SortBy.COUNTRY]: user => user.location.country,
            [SortBy.NAME]: user => user.name.first,
            [SortBy.LAST]: user => user.name.last
        };

        return filteredUsers.toSorted((a, b) => {
            const extractProperty = compareProperties[sorting];
            return extractProperty(a).localeCompare(extractProperty(b));
        });
    }, [filteredUsers, sorting]);

    return (
        <div className="App">
            <h1>Lista de usuarios</h1>
            <Results />
            <header>
                <button onClick={toggleColors}>
                    Colorear filas
                </button>

                <button onClick={toggleSortByCountry}>
                    {sorting === SortBy.COUNTRY ? "No ordenar por país" : "Ordenar por país"}
                </button>

                <button onClick={handleReset}>
                    Resetear estado
                </button>

                <input placeholder="Filtra por país" onChange={(e) => {
                    setFilterCountry(e.target.value);
                }} />

            </header>
            <main>
                {
                    users.length > 0
                        ? <UsersList
                            changeSorting={handleChangeSort}
                            deleteUser={handleDelete}
                            showColors={showColors}
                            users={sortedUsers}
                        />
                        : !isLoading && !isError && <p>No hay usuarios</p>
                }
                {
                    isLoading
                        ? <p>Cargando...</p>
                        : isError
                            ? <p>Hubo un error cargando los usuarios</p>
                            : hasNextPage ? <button onClick={() => void fetchNextPage()}>Cargar mas usuarios</button>
                                : <p>No hay más datos</p>
                }
            </main>
        </div>
    );
}

export default App;
