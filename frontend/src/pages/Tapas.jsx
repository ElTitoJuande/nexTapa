import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

import Container from "../components/layout/Container";
import Section from "../components/layout/Section";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import Tag from "../components/common/Tag";
import RatingBar from "../components/common/RatingBar";

import { itemService } from "../services/itemService";
import { ItemGallery } from "../components/common/ItemGallery";

export const Tapas = () => {
   const navigate = useNavigate();
   const { id } = useParams();
   const [tapa, setTapa] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      if (id) {loadTapa();}
   }, [id]);

   const loadTapa = async () => {
      try {
         setLoading(true);
         const response = await itemService.getById(id);
         if (!response || !response.data) {
            setError("Tapa no encontrada");
          
            return;
         }
         setTapa(response.data);
      } catch (err) {
         console.error("Error al cargar la tapa:", err);
         setError("No se pudo cargar la tapa.");
      } finally {
         setLoading(false);
      }
   };

   if (loading) {
      return (
         <Container>
            <div className="flex items-center justify-center h-screen">
               <p className="text-lg">Cargando tapa...</p>
            </div>
         </Container>
      );
   }

   if (error || !tapa) {
      return (
         <Container>
            <div className="flex flex-col items-center justify-center h-screen">
               <p className="text-lg text-red-500 mb-4">
                  {error || "Tapa no encontrada"}
               </p>
               <Button onClick={() => navigate("/")}>Volver al inicio</Button>
            </div>
         </Container>
      );
   }

   return (
      <div>
         {/* HERO IMAGE */}
         <div className="relative max-w-3xl mx-auto mt-4 h-96">
            <img
               src={tapa.mainImage || "/fallback.png"}
               alt={tapa.name}
               className="w-full h-full object-cover rounded-xl shadow-md"
            />
            <div className="absolute inset-0 bg-black/20 rounded-xl" />
            {/* TOP BAR */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
               <button
                  onClick={() => navigate(-1)}
                  className="bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     fill="none"
                     viewBox="0 0 24 24"
                     strokeWidth={1.5}
                     stroke="currentColor"
                     className="w-6 h-6"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                     />
                  </svg>
               </button>
               <span className="text-white font-semibold">nexTapa</span>
            </div>
         </div>

         <Container>
            {/* TITLE */}
            <div className="flex justify-between items-center mt-4">
               <h1 className="text-3xl font-bold">{tapa.name}</h1>
               {tapa.isFree ? (
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
                   Tapa Gratis
                  </span>
               ) : (
                  tapa.price > 0 && (
                     <span className="text-xl font-semibold text-orange-500">
                        {tapa.price}€
                     </span>
                  )
               )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-sm text-neutral-500 mt-2">{tapa.description}</p>

            {/* CATEGORIES */}
            {tapa.categories?.length > 0 && (
               <Section title="Categorías">
                  <div className="flex gap-2 flex-wrap">
                     {tapa.categories.map((cat, i) => (
                        <Badge key={i} variant="feature">
                           {cat}
                        </Badge>
                     ))}
                  </div>
               </Section>
            )}

            {/* ALÉRGENOS */}
            {tapa.allergens?.length > 0 && (
               <Section title="Alérgenos">
                  <div className="flex gap-2 flex-wrap">
                     {tapa.allergens.map((allergen, i) => (
                        <Badge key={i} variant="alert">
                           {allergen}
                        </Badge>
                     ))}
                  </div>
               </Section>
            )}

            {/* OPCIONES DIETÉTICAS */}
            {tapa.dietaryOptions?.length > 0 && (
               <Section title="Opciones dietéticas">
                  <div className="flex gap-2 flex-wrap">
                     {tapa.dietaryOptions.map((diet, i) => (
                        <Tag key={i} label={diet} />
                     ))}
                  </div>
               </Section>
            )}

            {/* DISPONIBILIDAD */}
            <Section title="Disponibilidad">
               <p>
                  {tapa.available ? "Disponible" : "No disponible"}{" "}
                  {tapa.seasonalItem && "(Item de temporada)"}{" "}
                  {tapa.specialDay && `- Especial del día: ${tapa.specialDay}`}
               </p>
            </Section>

            {/* RATING */}
            <Section title="Valoración">
               <div className="flex items-center gap-4">
                  <div>
                     <p className="text-3xl font-bold">{tapa.averageRating}</p>
                     <p className="text-sm text-neutral-400">
                        {tapa.totalReviews} opiniones
                     </p>
                  </div>
                  <div className="flex-1 space-y-2">
                     <RatingBar
                        stars={5}
                        value={Math.round((tapa.averageRating / 5) * 100)}
                     />
                  </div>
               </div>
            </Section>

            {/* GALERÍA DE TAPAS */}
            <Section title={`Todas las tapas de  ${tapa.establishment.name}`}>
               <ItemGallery establishmentId={tapa.establishment._id} />
            </Section>

            {/* CTA */}
            <div className="mt-8 mb-6">
               <Button onClick={() => navigate(`/establishment/${tapa.establishment._id}`)} className="w-full bg-orange-500 py-4 rounded-xl text-white font-semibold hover:bg-orange-600">
            Volver al establecimiento {tapa.establishment.name}
               </Button>
            </div>
         </Container>
      </div>
   );
};
