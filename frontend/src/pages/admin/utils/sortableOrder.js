import { arrayMove } from "@dnd-kit/sortable";

export const sortByOrder = (collection = []) =>
  [...collection].sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0));

export const moveByDndIds = (
  collection,
  activeId,
  overId,
  getId = (item) => item?._id,
) => {
  const oldIndex = collection.findIndex((item) => getId(item) === activeId);
  const newIndex = collection.findIndex((item) => getId(item) === overId);

  if (oldIndex < 0 || newIndex < 0) {
    return collection;
  }

  return arrayMove(collection, oldIndex, newIndex);
};

export const buildOrderPayload = (
  collection,
  getId = (item) => item?._id,
) => collection.map((item, order) => ({ id: getId(item), order }));

export const assignSequentialOrder = (collection) =>
  collection.map((item, order) => ({ ...item, order }));

