export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong.') {
  if (!error?.response) {
    return 'Cannot reach backend API. Check VITE_API_URL and backend deployment status, then retry.'
  }

  return error?.response?.data?.message || error?.response?.data?.error || fallbackMessage
}
