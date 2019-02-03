import { ActionCreator, AnyAction, Dispatch } from 'redux';
import { ICreateUser, ILoginUser, ILoginResponse } from '../../@types';
import { api } from '../../utils';
import { AUTH_USER_SET, AUTH_TOKEN_SET, FLASH_GREEN_SET, FLASH_RED_SET } from '../constants';

// Helper functions
export const getToken = state => {
	return state.sessionState.token;
};

const makeCreator = (type: string, ...argNames: string[]): ActionCreator<AnyAction> => (
	...args: any[]
) => {
	const action = { type };
	argNames.forEach((arg, index) => {
		action[argNames[index]] = args[index];
	});
	return action;
};


// Action Creators
const setUser = makeCreator(AUTH_USER_SET, 'user');
const setToken = makeCreator(AUTH_TOKEN_SET, 'token');

const setGreenFlash = makeCreator(FLASH_GREEN_SET, 'msgGreen');
const setRedFlash = makeCreator(FLASH_RED_SET, 'msgRed');

// Actions
export const signUp = (body: ICreateUser) => async (
	dispatch: Dispatch
): Promise<ILoginResponse> => {
	try {
		const {
			data: { response }
		} = await api.post('/auth/signup', body);
		dispatch(setToken(response.token));
		dispatch(setUser(response.user));
		return response;
	} catch (error) {
		throw error.response.data;
	}
};

export const signIn = (body: ILoginUser) => async (dispatch: Dispatch): Promise<ILoginResponse> => {
	try {
		const {
			data: { response }
		} = await api.post('/auth/login', body);
		dispatch(setToken(response.token));
		dispatch(setUser(response.user));
		return response;
	} catch (error) {
		if (error.response) throw error.response.data;
		else throw error;
	}
};

export const signOut = () => async (dispatch: Dispatch) => {
	try {
		dispatch(setToken(''));
		dispatch(setUser(null));
	} catch (error) {
		throw error;
	}
};

export const forgotPassword = async (email: string) => {
	try {
		const {
			data: { response }
		} = await api.post('/api/auth/forgot', { email });
		return response;
	} catch (error) {
		throw error.response.data;
	}
};

export const resetPassword = async (password, passwordConfirm, token) => {
	try {
		const {
			data: { response }
		} = await api.post('/api/auth/reset', {
			password,
			passwordConfirm,
			token
		});
		return response;
	} catch (error) {
		throw error.response.data;
	}
};

export const sendFlashMessage = (msg, type = 'red') => (dispatch: Dispatch) => {
	type === 'red' ? dispatch(setRedFlash(msg)) : dispatch(setGreenFlash(msg));
};

export const clearFlashMessages = () => (dispatch: Dispatch) => {
	dispatch(setGreenFlash(''));
	dispatch(setRedFlash(''));
};

export const refreshToken = params => async (dispatch: Dispatch, getState) => {
	try {
		const token = getToken(getState());
		if (!token) {
			dispatch(setUser(null));
			dispatch(setToken(null));
			return null;
		}
		const {
			data: { response }
		} = await api.get('/api/auth/refresh', {
			params,
			headers: { Authorization: `Bearer ${token}` }
		});
		dispatch(setUser(response.user));
		dispatch(setToken(response.token));
		return response;
	} catch (error) {
		throw error.response.data;
	}
};

export const storageChanged = e => (dispatch, getState) => {
	const token = getToken(getState());
	if (!token) signOut()(dispatch);
	else dispatch(setToken(token));
};