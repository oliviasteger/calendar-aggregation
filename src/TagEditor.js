import React from "react";

export default function TagEditor({ options, tags, setTags }) {
    const deleteTag = (tag) => {
        setTags(
            Object.fromEntries(Object.entries(tags).filter(([t]) => t !== tag))
        );
    };

    return (
        <div className="table-responsive">
            <table className="table align-middle table-striped table-bordered">
                <thead>
                    <tr>
                        <th scope="col">Tag</th>
                        {Object.keys(options).map((o) => (
                            <th
                                key={"col-" + o}
                                scope="col"
                                className="text-center"
                            >
                                {o}
                            </th>
                        ))}
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(tags).map((t, ix) => (
                        <tr key={"row-" + ix}>
                            <td>{t}</td>
                            {Object.keys(options).map((o) => (
                                <td
                                    key={"row-" + ix + "-" + o}
                                    className="text-center"
                                >
                                    {tags[t].includes(o) ? "✅" : "❌"}
                                </td>
                            ))}
                            <td className="text-center">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => deleteTag(t)}
                                >
                                    <i className="bi bi-trash-fill"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
