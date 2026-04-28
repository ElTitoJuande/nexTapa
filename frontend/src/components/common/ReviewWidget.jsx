import { useState, useEffect, useCallback } from "react";
import { Star, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { reviewService } from "../../services/reviewService";

// ── StarRow interactiva ───────────────────────────────────────────────────────
const StarRow = ({ value, onChange, readonly = false, size = 24 }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hovered || value);
        return (
          <button
            key={n}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange?.(n)}
            onMouseEnter={() => !readonly && setHovered(n)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={`transition-transform duration-100 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-115"
            }`}
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={`transition-colors duration-100 ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-zinc-600"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

// ── ReviewWidget ──────────────────────────────────────────────────────────────
export const ReviewWidget = ({ targetType, targetId }) => {
  const { user } = useAuth();
  const canReview = user?.role === "cliente" || user?.role === "hostelero";

  const [avg, setAvg] = useState(null);
  const [count, setCount] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewService.getByTarget(targetType, targetId);
      setAvg(data.avg);
      setCount(data.count);
      if (user && data.reviews) {
        const userId = user._id || user.id;
        const mine = data.reviews.find(
          (r) => (r.user?._id ?? r.user?._id ?? r.user) === userId,
        );
        if (mine) {
          setMyReview(mine);
          setSelected(mine.rating);
        } else {
          setMyReview(null);
          setSelected(0);
        }
      }
    } catch (err) {
      console.error("[ReviewWidget] fetchReviews:", err);
    }
  }, [targetType, targetId, user]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Al pulsar una estrella: crea o actualiza directamente
  const handleRate = async (rating) => {
    if (!canReview || loading) {
      return;
    }
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      if (myReview) {
        await reviewService.update(myReview._id, rating);
      } else {
        await reviewService.create(
          targetType === "establishment"
            ? { establishmentId: targetId, rating }
            : { itemId: targetId, rating },
        );
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await fetchReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Media ── */}
      <div className="flex items-center gap-3">
        {avg ? (
          <>
            <span className="text-4xl font-black text-white leading-none">
              {avg.toFixed(1)}
            </span>
            <div className="flex flex-col gap-0.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const fill = Math.min(Math.max(avg - (n - 1), 0), 1);
                  return (
                    <span key={n} className="relative inline-block">
                      <Star size={14} className="fill-zinc-700 text-zinc-700" />
                      <span
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${fill * 100}%` }}
                      >
                        <Star
                          size={14}
                          className="fill-amber-400 text-amber-400"
                        />
                      </span>
                    </span>
                  );
                })}
              </div>
              <span className="text-xs text-zinc-500">
                {count} {count === 1 ? "valoración" : "valoraciones"}
              </span>
            </div>
          </>
        ) : (
          <span className="text-xs text-zinc-500 italic">
            Sin valoraciones aún
          </span>
        )}
      </div>

      {/* ── Separador ── */}
      <div className="h-px bg-zinc-800" />

      {/* ── Sin sesión o admin ── */}
      {(!user || !canReview) && (
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <LogIn size={13} />
          <span>Inicia sesión para valorar</span>
        </div>
      )}

      {/* ── Con sesión — widget de valoración ── */}
      {canReview && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-zinc-400">
            {myReview
              ? "Tu valoración — pulsa para cambiar"
              : "Valora este contenido"}
          </span>
          <div className="flex items-center gap-3">
            <StarRow
              value={selected}
              onChange={handleRate}
              readonly={loading}
              size={26}
            />
            {loading && (
              <span className="text-xs text-zinc-500">Guardando…</span>
            )}
            {saved && (
              <span className="text-xs text-emerald-400">✓ Guardado</span>
            )}
          </div>
          {error && <span className="text-xs text-red-400">{error}</span>}
        </div>
      )}
    </div>
  );
};

export default ReviewWidget;
