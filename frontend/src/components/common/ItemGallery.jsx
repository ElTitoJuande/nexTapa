import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { itemService } from "../../services/itemService.js";
import Section from "../layout/Section.jsx";
import { cloudinaryPresets } from "../../utils/cloudinaryHelpers.js";

const DEFAULT_IMAGE = "/Logo.png";

export const ItemGallery = ({
  establishmentId,
  currentItemId,
  establishmentName,
  distance,
}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await itemService.getByEstablishment(establishmentId, {
          available: true,
        });
        setItems(response.data || []);
      } catch (error) {
        console.error("Error fetching items:", error);
      } finally {
        setLoading(false);
      }
    };
    if (establishmentId) {
      fetchItems();
    }
  }, [establishmentId]);

  const filtered = currentItemId
    ? items.filter((item) => item._id !== currentItemId)
    : items;

  if (loading || filtered.length === 0) {
    return null;
  }

  const getImageSrc = (mainImage) => {
    if (!mainImage) return DEFAULT_IMAGE;
    return cloudinaryPresets.thumbnail(mainImage);
  };

  return (
    <Section title={`Tapas de ${establishmentName}`}>
      <div className="flex gap-2 mt-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filtered.map((item) => (
          <button
            key={item._id}
            onClick={() =>
              navigate(`/items/${item.slug}`, { state: { distance } })
            }
            className="group relative flex-none w-24 h-24 overflow-hidden rounded-lg bg-neutral-800"
          >
            <img
              src={getImageSrc(item.mainImage)}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_IMAGE;
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex items-end">
              <p className="text-white text-[9px] font-medium p-1.5 line-clamp-1 w-full text-left leading-tight">
                {item.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Section>
  );
};