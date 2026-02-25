
//src/components/home/FeaturedSection.jsx
// Este componente muestra las tapas destacadas en la página de inicio. Se encarga de cargar los datos desde el backend y manejar los estados de carga y error.

import Card from "../common/Card";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { itemService } from "../../services/itemService";
import Container from "../layout/Container";

export const FeaturedSection = () => {
   const [featuredItems, setFeaturedItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   const navigate = useNavigate();

   useEffect(() => {
      loadAllItems();
   }, []);

   const loadAllItems = async () => {
      try {
         setLoading(true);
         setError(null);
         // Ojo: Asegúrate de que en itemService se llame getAllItems (sin la 'n' extra)
         const response = await itemService.getTopRatedItems(); 
         setFeaturedItems(response.data || response);
      } catch (err) {
         setError("Error al cargar las tapas destacadas.");
      } finally {
         setLoading(false);
      }
   };

   
   if (loading) {
      return (
         <Container>
            <div className="flex items-center justify-center h-40">
               <p className="text-lg">Cargando tapas...</p>
            </div>
         </Container>
      );
   }

   if (error) {
      return (
         <Container>
            <p className="text-red-500 p-4 text-center">{error}</p>
         </Container>
      );
   }

   return (
      <section className="px-4 mt-6">
         <h2 className="text-lg font-semibold mb-3">Las Mejores Tapas</h2>
      
         {featuredItems.length === 0 ? (
            <p>No hay tapas disponibles en este momento.</p>
         ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {featuredItems.map((item, index) => (
                  
                  <Card key={item.id || index}
                     onClick={() => navigate(`/items/${item._id || item.id}`)}
                     className="cursor-pointer hover:shadow-lg transition-shadow"
                  >
                     <img src={item.mainImage} alt={item.name} className="h-32 w-full object-cover" />
                     
                     <div className="p-2">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-orange-400">{item.price > 0 ? `${item.price}€` : "Gratis"}</p>
                     </div>
                  </Card>
               ))}
            </div>
         )}
      </section>
   );
};