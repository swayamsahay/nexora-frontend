export function getApiErrorMessage(error, fallbackMessage = 'Something went wrong.') {
	if (!error?.response) {
		return 'Cannot reach backend API. Start your backend server and try again.'
	}

	return error?.response?.data?.message || error?.response?.data?.error || fallbackMessage
}