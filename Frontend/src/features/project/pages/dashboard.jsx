import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../component/AppLayout";
import ProjectTitleModal from "../component/ProjectTitleModal";
import DeleteConfirmModal from "../component/DeleteConfirmModal";
import useProject from "../hooks/useProject";
import styles from "../styles/dashboard.module.css";
import useAuth from "../../auth/hooks/useAuth";
import useProjectSocket from "../hooks/useProjectSocket";
import GeneratingOverlay from "../../shared/components/GeneratingOverlay";
import AiLimitModal from "../../shared/components/AiLimitModal";

// ─── Prompt suggestion tag data ─────────────────────────────────────
const SUGGESTION_TAGS = [
  { label: "SaaS Admin", icon: "dashboard" },
  { label: "Crypto UI", icon: "currency_bitcoin" },
  { label: "E-commerce", icon: "shopping_bag" },
  { label: "Portfolio", icon: "person" },
  { label: "Landing Page", icon: "web" },
  { label: "Dark Mode", icon: "dark_mode" },
];

// Project Card
const ProjectCard = ({ project, onClick, onDelete }) => {
  const isGenerating = project.status === "generating";

  return (
    <div className={styles.projectCard} onClick={onClick}>
      {/* Thumbnail */}
      <div className={styles.cardThumb}>
        <div className={styles.cardThumbGradient} />
        {project.thumbnailUrl ? (
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            className={styles.cardThumbImg}
          />
        ) : (
          <div className={styles.cardThumbPlaceholder}>
            <span
              className={`material-symbols-outlined ${styles.cardThumbPlaceholderIcon}`}
            >
              web
            </span>
          </div>
        )}

        {/* Status Badge */}
        <div
          className={`${styles.statusBadge} ${isGenerating ? styles.statusGenerating : styles.statusCompleted}`}
        >
          {isGenerating && (
            <span
              className="material-symbols-outlined animate-spin-slow"
              style={{ fontSize: "12px" }}
            >
              progress_activity
            </span>
          )}
          {!isGenerating && (
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "12px" }}
            >
              check_circle
            </span>
          )}
          {isGenerating ? "Generating" : "Completed"}
        </div>
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>
          {project.title || "Untitled Project"}
        </h3>
        {project.prompt && (
          <p className={styles.cardDesc}>"{project.prompt}"</p>
        )}

        {/* Delete button row */}
        <div className={styles.cardFooter}>
          <button
            className={styles.cardDeleteBtn}
            title="Delete project"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project._id);
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              delete
            </span>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Skeleton Card Placeholder
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonThumb} />
    <div className={styles.skeletonBody}>
      <div className={styles.skeletonLine} style={{ width: "70%" }} />
      <div className={styles.skeletonLine} style={{ width: "90%" }} />
      <div className={styles.skeletonLine} style={{ width: "50%" }} />
    </div>
  </div>
);

// Dashboard Page
const DashboardPage = () => {
  const navigate = useNavigate();

  const {
    handleCreateProject,
    handleGetAllProjects,
    handleDeleteProject,
    user,
    allProjects,
    loading,
    setTitle,
  } = useProject();
  console.log("User Id for socket ", user?.userId, "\n", user);
  const { isGenerating, setIsGenerating, aiLimitError, setAiLimitError } = useProjectSocket(user?.userId);

  const [prompt, setPrompt] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [compilingTitle, setCompilingTitle] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null); // { _id, title }

  // Fetch all projects on mount to populate the grid + sidebar
  useEffect(() => {
    handleGetAllProjects();
  }, []);

  // Clicking Compile — open title modal first
  const handleCompile = () => {
    if (!prompt.trim()) return;
    setIsModalOpen(true);
  };

  // Called by modal on confirm — set title, create project, start generating overlay
  const handleModalConfirm = async (enteredTitle) => {
    setTitle(enteredTitle);
    setCompilingTitle(enteredTitle);
    setIsCompiling(true);
    setIsGenerating(true);
    await handleCreateProject(prompt.trim());
    setIsCompiling(false);
    // navigate("/project");
  };

  // Handle pressing Enter in the prompt input
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCompile();
    }
  };

  // Handle clicking a suggestion tag
  const handleTagClick = (label) => {
    setPrompt(`Build a ${label} website with a modern, premium dark theme`);
  };

  // Handle clicking a project card
  const handleProjectClick = (projectId) => {
    navigate(`/project?id=${projectId}`);
  };

  return (
    <AppLayout>
      <main className={styles.page}>
        <div className={styles.inner}>
          {/*  Hero Prompt Terminal Block */}
          <section className={styles.heroSection}>
            <div className={styles.heroTextWrap}>
              <h1 className={styles.heroHeadline}>
                What webpage would you like{" "}
                <span className={styles.heroAccent}>GetWeb</span> to compile
                today?
              </h1>
              <p className={styles.heroSubtitle}>
                The world's most powerful AI web generation engine at your
                fingertips.
              </p>
            </div>

            <div className={styles.promptWrap}>
              {/* Terminal Input Block */}
              <div className={styles.promptTerminal}>
                <div className={styles.promptInputRow}>
                  <span
                    className={`material-symbols-outlined ${styles.promptIcon}`}
                  >
                    auto_awesome
                  </span>
                  <input
                    className={styles.promptInput}
                    type="text"
                    placeholder="Describe your vision (e.g. A dark mode SaaS dashboard)..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <button
                  className={styles.compileBtn}
                  onClick={handleCompile}
                  disabled={isCompiling || !prompt.trim()}
                >
                  {isCompiling ? (
                    <>
                      <span
                        className="material-symbols-outlined animate-spin-slow"
                        style={{ fontSize: "18px" }}
                      >
                        progress_activity
                      </span>
                      Compiling...
                    </>
                  ) : (
                    <>
                      Compile
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "18px" }}
                      >
                        send
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Suggestion Tags */}
              <div className={styles.tagRow}>
                {SUGGESTION_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    className={styles.tagPill}
                    onClick={() => handleTagClick(tag.label)}
                  >
                    <span
                      className={`material-symbols-outlined ${styles.tagIcon}`}
                    >
                      {tag.icon}
                    </span>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Recent Generations Deck ────────────────────────────── */}
          <section className={styles.recentSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Generations</h2>
            </div>

            <div className={styles.projectGrid}>
              {loading ? (
                /* Skeleton loading state */
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : allProjects && allProjects.length > 0 ? (
                /* Live project cards */
                allProjects.map((project) => (
                  <ProjectCard
                    key={project._id}
                    project={project}
                    onClick={() => handleProjectClick(project._id)}
                    onDelete={(id) =>
                      setPendingDelete({ _id: id, title: project.title })
                    }
                  />
                ))
              ) : (
                /* Empty state */
                <div className={styles.emptyState}>
                  <span
                    className={`material-symbols-outlined ${styles.emptyStateIcon}`}
                  >
                    layers
                  </span>
                  <p className={styles.emptyStateText}>
                    No projects yet. Describe your vision above to get started.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* ── Project Title Modal (compile flow) ───────────────────────── */}
      <ProjectTitleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleModalConfirm}
        promptHint={prompt}
        mode="compile"
      />

      {/* ── AI Limit Modal — shown when Gemini quota is exhausted ─── */}
      <AiLimitModal
        isOpen={aiLimitError}
        onClose={() => setAiLimitError(false)}
      />

      {/* ── AI Generating Overlay — shown while background worker runs ── */}
      <GeneratingOverlay
        isVisible={isGenerating}
        title={compilingTitle}
      />

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <DeleteConfirmModal
        isOpen={!!pendingDelete}
        projectTitle={pendingDelete?.title}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) handleDeleteProject(pendingDelete._id);
          setPendingDelete(null);
        }}
      />
    </AppLayout>
  );
};

export default DashboardPage;
