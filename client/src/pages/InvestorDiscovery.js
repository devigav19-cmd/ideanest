import React, { useEffect, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import ideaService from "../services/ideaService";
import IdeaCard from "../components/ideas/IdeaCard";
import Spinner from "../components/common/Spinner";

const categories = [
  "All",
  "Technology",
  "Business",
  "Social Impact",
  "Education",
  "Healthcare",
  "Environment",
  "Other",
];

const stages = ["All", "Concept", "Prototype", "MVP", "Scaling"];

function InvestorDiscovery() {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stage, setStage] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchIdeas();
    // eslint-disable-next-line
  }, [page, category, stage]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== "All") params.category = category;
      if (stage !== "All") params.stage = stage;

      const res = await ideaService.getAll(params);
      setIdeas(res.data.data);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err) {
      console.error("Failed to load ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchIdeas();
  };

  return (
    <div className="investor-page">
      <div className="page-header">
        <h1>Discover Ideas</h1>
        <p className="text-muted">Browse and filter ideas to find your next investment opportunity</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ideas by title or keyword..."
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="filter-group">
          <div className="filter-item">
            <label><FiFilter /> Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Stage</label>
            <select
              value={stage}
              onChange={(e) => { setStage(e.target.value); setPage(1); }}
            >
              {stages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Spinner />
      ) : ideas.length === 0 ? (
        <div className="empty-state">
          <h3>No ideas found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="ideas-grid">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default InvestorDiscovery;
