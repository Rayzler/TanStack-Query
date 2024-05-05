import useUsers from "../hooks/useUsers";

function Results() {
    const { users } = useUsers();

    return (
        <h3>Results: {users.length}</h3>
    );
}

export default Results;