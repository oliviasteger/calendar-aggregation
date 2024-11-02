import React, { useState } from "react";
import ICAL from "ical.js";

// Properties to object names mapping
const Properties = {
    Name: "summary",
    Location: "location",
    Description: "description",
    Contact: "contact",
    Organizer: "organizer",
    Attendee: "attendee",
    Attachments: "attach",
    Comments: "comment",
    CreationDate: "created"
};

function App() {
    const [files, setFiles] = useState({});
    const [tags, setTags] = useState([]);
    const [tagsMap, setTagsMap] = useState({});
    const [calendar, setCalendar] = useState(null);
    const [ready, setReady] = useState(true);
    const [selectedTags, setSelectedTags] = useState([]);

    const handleFiles = (x) => {
        setFiles(x.target.files);
    };

    const handleTag = (x) => {
        x.preventDefault();

        if (tags.includes(x.target.elements.tag.value)) {
            return;
        }

        const tag = x.target.elements.tag.value;
        setTags([...tags, tag]);
        setTagsMap({
            ...tagsMap,
            [tag]: Object.keys(Properties).filter(
                (p) => x.target.elements["prop-checkbox-" + p].checked
            )
        });
    };

    const handleAggregation = async () => {
        setReady(true);
        const props = [
            "dtstart",
            "dtend",
            ...Object.keys(Properties)
                .filter((p) => selectedTags.some((t) => tagsMap[t].includes(p)))
                .map((p) => Properties[p])
        ];

        const newCalendar = new ICAL.Component("VCALENDAR");

        Array.from(files).forEach((f) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const text = e.target.result;
                const calData = ICAL.parse(text);
                const calObject = new ICAL.Component(calData);
                calObject.getAllSubcomponents().forEach((s) => {
                    const propertiesToRemove = s
                        .getAllProperties()
                        .filter((p) => !props.includes(p.name));

                    propertiesToRemove.forEach((p) => {
                        s.removeProperty(p);
                    });

                    newCalendar.addSubcomponent(s);
                });
                setCalendar(newCalendar.toString());
            };

            reader.readAsText(f);
        });
        setReady(false);
    };

    const handleDownload = () => {
        const output = new Blob([calendar], { type: "text/calendar" });
        const url = URL.createObjectURL(output);
        const link = document.createElement("a");

        link.href = url;
        link.setAttribute("download", "screenedCalendar.ics");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div
                className="modal fade"
                id="exampleModal"
                tabIndex="-1"
                aria-labelledby="exampleModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h1
                                className="modal-title fs-5"
                                id="exampleModalLabel"
                            >
                                Create calendar
                            </h1>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            To create this calendar, the system will read each
                            event's{" "}
                            {[
                                "start date",
                                "end date",
                                ...Object.keys(Properties)
                                    .filter((p) =>
                                        selectedTags.some((t) =>
                                            tagsMap[t].includes(p)
                                        )
                                    )
                                    .map((t) => t.toLowerCase())
                            ].join(", ")}
                            .
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Close
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                data-bs-dismiss="modal"
                                onClick={() => handleAggregation()}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="container"
                style={{ paddingTop: "3em", paddingBottom: "2em" }}
            >
                <h1 className="text-primary">Calendar Aggregation Tool</h1>
                <h5 className="text-secondary">🔐 Only share what you want</h5>
            </div>

            <div className="container" style={{ paddingBottom: "3em" }}>
                <div className="accordion" id="accordionExample">
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseOne"
                                aria-expanded="true"
                                aria-controls="collapseOne"
                            >
                                Step 1: Upload Calendars
                            </button>
                        </h2>
                        <div
                            id="collapseOne"
                            className="accordion-collapse collapse show"
                            data-bs-parent="#accordionExample"
                        >
                            <div className="accordion-body">
                                <div className="mb-3">
                                    <label
                                        htmlFor="files"
                                        className="form-label"
                                    >
                                        Upload calendar files
                                    </label>
                                    <input
                                        id="files"
                                        className="form-control"
                                        type="file"
                                        accept=".ics"
                                        onChange={(x) => handleFiles(x)}
                                        aria-describedby="fileHelpBlock"
                                        multiple
                                    />
                                    <div
                                        id="fileHelpBlock"
                                        className="form-text"
                                    >
                                        Uploaded calendars must be in{" "}
                                        <kbd>.ics</kbd> format. There are
                                        instructions available online for how to
                                        export these calendars for{" "}
                                        <a href="https://support.google.com/calendar/answer/37111?hl=en">
                                            Google Calendar
                                        </a>
                                        ,{" "}
                                        <a href="https://support.apple.com/guide/calendar/import-or-export-calendars-icl1023/mac#:~:text=Export%20a%20calendar%27s%20events,ics)%20file%20only.">
                                            Apple Calendar
                                        </a>
                                        , and{" "}
                                        <a href="https://support.microsoft.com/en-us/office/export-an-outlook-calendar-to-google-calendar-662fa3bb-0794-4b18-add8-9968b665f4e6">
                                            Outlook Calendar
                                        </a>{" "}
                                        users.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseTwo"
                                aria-expanded="false"
                                aria-controls="collapseTwo"
                            >
                                Step 2: Create Tags
                            </button>
                        </h2>
                        <div
                            id="collapseTwo"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionExample"
                        >
                            <div className="accordion-body">
                                <form onSubmit={(x) => handleTag(x)}>
                                    <div className="form-floating mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="tag"
                                            placeholder="High security"
                                            required
                                        />
                                        <label htmlFor="tag">Tag name</label>
                                    </div>
                                    <div className="mb-3">
                                        <p>
                                            Which properties should the tag
                                            apply to?
                                        </p>
                                        {Object.keys(Properties).map((p) => (
                                            <div key={p} className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    id={"prop-checkbox-" + p}
                                                    type="checkbox"
                                                ></input>
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={
                                                        "prop-checkbox-" + p
                                                    }
                                                >
                                                    {p}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mb-3">
                                        <input
                                            className="btn btn-primary"
                                            type="submit"
                                            value="Add tag"
                                        ></input>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="accordion-item">
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button collapsed"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target="#collapseThree"
                                aria-expanded="false"
                                aria-controls="collapseThree"
                            >
                                Step 3: Download Calendar
                            </button>
                        </h2>
                        <div
                            id="collapseThree"
                            className="accordion-collapse collapse"
                            data-bs-parent="#accordionExample"
                        >
                            <div className="accordion-body">
                                <form
                                    onSubmit={(x) => {
                                        x.preventDefault();
                                        setSelectedTags(
                                            tags.filter(
                                                (t) =>
                                                    x.target.elements[
                                                        "tag-checkbox-" + t
                                                    ].checked
                                            )
                                        );
                                    }}
                                >
                                    <p>Which tags should be included?</p>
                                    <div></div>
                                    <div hidden={tags.length !== 0}>
                                        <div
                                            className="alert alert-info"
                                            role="alert"
                                        >
                                            Please create tags before
                                            downloading a calendar.
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        {tags.map((t) => (
                                            <div key={t} className="form-check">
                                                <input
                                                    id={"tag-checkbox-" + t}
                                                    type="checkbox"
                                                    className="form-check-input"
                                                ></input>
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={
                                                        "tag-checkbox-" + t
                                                    }
                                                >
                                                    {t}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <input
                                        disabled={tags.length === 0}
                                        className="btn btn-primary"
                                        type="submit"
                                        value="Create calendar"
                                        data-bs-toggle="modal"
                                        data-bs-target="#exampleModal"
                                    ></input>
                                    <input
                                        disabled={ready}
                                        className="btn btn-outline-primary"
                                        value="Download calendar"
                                        onClick={() => handleDownload()}
                                    ></input>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
