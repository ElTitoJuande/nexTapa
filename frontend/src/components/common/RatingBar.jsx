import { useState, useEffect, useCallback } from "react";
import { Star, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { reviewService } from "../../services/reviewService";

// ── Estrellas interactivas ────────────────────────────────────────────────────
const StarRow = ({ value, onChange, readonly = false, size = 28 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
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
            className={`transition-transform duration-100 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          >
            <Star
              size={size}
              className={`transition-colors duration-100 ${filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-zinc-600"}`}
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(async () => {
    try {
      const data = await reviewService.getByTarget(targetType, targetId);
      setAvg(data.avg);
      setCount(data.count);
      if (user && data.reviews) {
        const userId = user._id || user.id;
        const mine = data.reviews.find(
          (r) => (r.user?._id ?? r.user) === userId,
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
    <div className="flex flex-col gap-2">
      {/* ── Una sola fila: media + estrellas ── */}
      <div className="flex items-center gap-4">
        {/* Número grande + contador */}
        <div className="flex flex-col items-center leading-none shrink-0">
          <span className="text-4xl font-black text-white">
            {avg ? avg.toFixed(1) : "—"}
          </span>
          <span className="text-xs text-zinc-500 mt-0.5">
            {count} {count === 1 ? "valoración" : "valoraciones"}
          </span>
        </div>

        {/* Divisor */}
        <div className="w-px h-10 bg-zinc-700 shrink-0" />

        {/* Estrellas — votar o login */}
        {canReview ? (
          <div className="flex flex-col gap-1">
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
            {error && <span className="text-xs text-red-400">{error}</span>}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-500 text-xs">
            <LogIn size={13} />
            <span>Inicia sesión para valorar</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewWidget;
