import {useAuthContext} from './auth.context'

export function useAuth() {
    const {state, login, logout} = useAuthContext()

    return {
        ...state,
        login,
        logout,
        isAdmin: state.user?.roles.includes('ADMIN') ?? false,
    }
}