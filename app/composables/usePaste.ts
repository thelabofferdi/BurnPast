import type {
  CreatePasteRequest,
  CreatePasteResponse,
  PasteMetadata,
  RevealPasteRequest,
  RevealPasteResponse
} from '~/types/paste'

export const usePaste = () => {
  const createPaste = async (request: CreatePasteRequest): Promise<CreatePasteResponse> => {
    return await $fetch<CreatePasteResponse>('/api/paste', { method: 'POST', body: request })
  }

  const getPasteMetadata = async (id: string): Promise<PasteMetadata> => {
    return await $fetch<PasteMetadata>(`/api/paste/${id}`)
  }

  const revealPaste = async (id: string, request: RevealPasteRequest = {}): Promise<RevealPasteResponse> => {
    return await $fetch<RevealPasteResponse>(`/api/paste/${id}/reveal`, {
      method: 'POST',
      body: request
    })
  }

  return { createPaste, getPasteMetadata, revealPaste }
}
