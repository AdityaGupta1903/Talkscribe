
export const Client_ID = "539834042648-k1udnbmtdko2jeepk0bvskdefv3m4g8f.apps.googleusercontent.com";
export const redirect_URI = "http://localhost:3000/code"
export const SSOURL = `https://accounts.google.com/o/oauth2/v2/auth?scope=profile email&include_granted_scopes=true&response_type=code&redirect_uri=${redirect_URI}&client_id=${Client_ID}&access_type=offline`