// src/pages/admin/ItemAdmin.jsx
// Página de administración para crear o editar tapas

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { itemService } from "../../services/itemService";
import { SaveButton } from "./adminComponents/SaveButton";
import { BasicInformationItem } from "./itemsComponents/BasicInformationItem";
import { PriceInformation } from "./itemsComponents/PriceInformation";
import { StateAndVisibility } from "./itemsComponents/StateAndVisibility";
import { Categories } from "./itemsComponents/Categories";
import { Allergens } from "./itemsComponents/Allargens";
import { DietaryOptions } from "./itemsComponents/DietaryOptions";
import { ItemPhotoSection } from "./itemsComponents/ItemPhotoSection";
import { ViewItemInAppButton } from "./itemsComponents/ViewItemInApp";
import { useGeolocation } from "../../hooks/useGeolocation.js";
import { toastService } from "../../services/toastService";

import "./styles/admin.css";
import "./styles/itemAdmin.css";

export const ItemAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const location = useLocation();
  const establishmentIdFromState = location.state?.establishmentId;
  const itemEditorBasePath = location.pathname.startsWith("/host/items")
    ? "/host/items"
    : "/admin/items";

  const { coords } = useGeolocation();

  const [form, setForm] = useState({
    name: "",
    description: "",
    establishment: establishmentIdFromState || "", // ← persiste desde el inicio
    modalities: [{ label: "Tapa", price: 0, isFree: false, available: true }],
    categories: [],
    allergens: [],
    dietaryOptions: [],
    available: true,
    featured: false,
    seasonalItem: false,
    specialDays: [],
    order: 0,
  });

  useEffect(() => {
    if (!isNew) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await itemService.getById(id);
      const data = res.data;
      setItem(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
        establishment: data.establishment?._id || data.establishment || "", // ← normaliza populated vs ID plano
        modalities: data.modalities?.length
          ? data.modalities
          : [{ label: "Tapa", price: 0, isFree: false, available: true }],
        categories: data.categories || [],
        allergens: data.allergens || [],
        dietaryOptions: data.dietaryOptions || [],
        available: data.available !== undefined ? data.available : true,
        featured: data.featured || false,
        seasonalItem: data.seasonalItem || false,
        specialDays: data.specialDays || [],
        order: data.order || 0,
      });
    } catch (err) {
      setError("Error al cargar la tapa", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const payload = {
        ...form,
        modalities: form.modalities.map((m) => ({
          ...m,
          isFree: m.price === 0,
        })),
        // establishment ya viene en form — no hace falta spread condicional
      };
      if (isNew) {
        const res = await itemService.create(payload);
        const newId = res.data._id;
        toastService.success("Tapa creada correctamente");
        navigate(`${itemEditorBasePath}/${newId}`, {
          replace: true,
          state: { establishmentId: form.establishment },
        });
      } else {
        await itemService.update(id, payload);
        setSuccess(true);
        toastService.success("Tapa guardada correctamente");
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      setError("Error al guardar la tapa", err);
      toastService.error("Error al guardar la tapa");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <p className="admin-loading">Cargando tapa...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => navigate(-1)}
        >
          ← Volver
        </button>
        <div>
          <h1 className="admin-title">
            {isNew ? "Nueva Tapa" : `Editar: ${item?.name || ""}`}
          </h1>
          {!isNew && item?.establishment && (
            <p className="admin-page-subtitle">{item.establishment.name}</p>
          )}
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {success && (
        <div className="admin-alert admin-alert-success">
          Tapa guardada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form">
        {/* Foto principal */}
        <div className="admin-section">
          <h2 className="admin-section-title">Fotos</h2>
          <ItemPhotoSection
            itemId={isNew ? null : id}
            mainImage={form.mainImage || item?.mainImage}
            onMainImageChange={(url) => handleChange("mainImage", url)}
          />
        </div>

        {/* Fila 1 */}
        <div className="admin-row">
          <BasicInformationItem form={form} handleChange={handleChange} />
          <StateAndVisibility form={form} handleChange={handleChange} />
        </div>

        {/* Fila 2 */}
        <div className="admin-row">
          <PriceInformation form={form} handleChange={handleChange} />
          <Categories form={form} handleChange={handleChange} />
        </div>

        {/* Fila 3 */}
        <div className="admin-row">
          <Allergens form={form} handleChange={handleChange} />
          <DietaryOptions form={form} handleChange={handleChange} />
        </div>

        <div className="admin-form-footer">
          <SaveButton saving={saving} />
          {!isNew && <ViewItemInAppButton slug={item?.slug} coords={coords} />}
        </div>
      </form>
    </div>
  );
};
