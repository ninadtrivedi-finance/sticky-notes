interface Props {
  search: string;
  onSearchChange: (value: string) => void;
  filter: "all" | "active" | "completed";
  onFilterChange: (filter: "all" | "active" | "completed") => void;
  onDeleteCompleted: () => void;
  noteCount: number;
  completedCount: number;
}

export function Toolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  onDeleteCompleted,
  noteCount,
  completedCount,
}: Props) {
  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <h1 className="app-title">Sticky Notes</h1>
        <span className="note-count">
          {noteCount} notes ({completedCount} done)
        </span>
      </div>
      <div className="toolbar-center">
        <input
          type="text"
          className="search-input"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="toolbar-right">
        <div className="filter-group">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => onFilterChange(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {completedCount > 0 && (
          <button className="delete-completed-btn" onClick={onDeleteCompleted}>
            Clear Done
          </button>
        )}
      </div>
    </div>
  );
}
