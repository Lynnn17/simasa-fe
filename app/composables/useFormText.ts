// composables/useFormText.ts
import { useTranslation } from "@/composables/useTranslation"

export function useFormText() {
  const { t } = useTranslation()

  // dialog title: Tambah, Edit, Hapus, Detail
  // entity should be the i18n KEY (e.g., "Organisasi"), not the translated value
  const getTitle = (
    action: "add" | "edit" | "delete" | "detail" | "data" | "select",
    entityKey: string
  ) => {
    const key = `form.${action}_title`
    const translatedEntity = t(entityKey)
    const translated = (t as any)(key, { v: translatedEntity })
    return translated !== key ? translated : `${action} ${translatedEntity}`
  }

  // placeholder input
  const getPlaceholder = (action: "input" | "select", field: string) => {
    const key = `form.placeholder.${action}`
    const title = t(field)
    const translated = (t as any)(key, { v: title })
    const defaultTxt = action == 'select' ? `Pilih ${title}` : `Masukkan ${title}`;
    return translated !== key ? translated : defaultTxt
  }

  // label input
  const getLabel = (field: string) => {
    const key = `form.label`
    const translated = t(key)
    return translated !== key ? translated : field
  }

  return {
    getTitle,
    getPlaceholder,
    getLabel,
  }
}
