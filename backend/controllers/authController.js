const authService = require('../services/authService');

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/api/v1/auth' };
const sendSession = (res, result, status = 200) => { res.cookie('refreshToken', result.session.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); res.status(status).json({ success: true, data: { user: result.user, accessToken: result.session.accessToken } }); };

const register = async (req, res) => sendSession(res, await authService.register(req.validated.body), 201);
const login = async (req, res) => sendSession(res, await authService.login(req.validated.body));
const refresh = async (req, res) => {
	if (!req.cookies.refreshToken) {
		return res.status(401).json({ success: false, error: { code: 'NO_REFRESH_TOKEN', message: 'No active session was found.' } });
	}
	try {
		return sendSession(res, await authService.rotate(req.cookies.refreshToken));
	} catch (error) {
		// Remove an expired token so the browser does not retry the same dead session.
		res.clearCookie('refreshToken', cookieOptions);
		throw error;
	}
};
const logout = async (req, res) => { if (req.cookies.refreshToken) await authService.revoke(req.cookies.refreshToken); res.clearCookie('refreshToken', cookieOptions); res.status(204).send(); };
const me = async (req, res) => res.json({ success: true, data: { user: await authService.getUser(req.user.sub) } });

module.exports = { register, login, refresh, logout, me };
