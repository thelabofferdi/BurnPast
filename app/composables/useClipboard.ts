/**
 * Clipboard utilities for BurnPast
 */

export const useClipboard = () => {
    const copied = ref(false)
    let timeout: NodeJS.Timeout | null = null

    /**
     * Copy text to clipboard with visual feedback
     */
    const copy = async (text: string): Promise<boolean> => {
        try {
            await navigator.clipboard.writeText(text)
            copied.value = true

            // Reset after 2 seconds
            if (timeout) clearTimeout(timeout)
            timeout = setTimeout(() => {
                copied.value = false
            }, 2000)

            return true
        } catch (error) {
            console.error('Failed to copy:', error)
            return false
        }
    }

    return {
        copied: readonly(copied),
        copy
    }
}
