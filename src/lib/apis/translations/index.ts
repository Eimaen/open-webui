import { TRANSLATE_API_BASE_URL } from '$lib/constants';

export const translate = async (token: string, text: string, targetLanguage: string, sourceLanguage: string) => {
    let error = null;
    const res = await fetch(`${TRANSLATE_API_BASE_URL}/translate`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            text,
            target_lang: targetLanguage,
            source_lang: sourceLanguage
        })
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            error = err.detail;
            console.log(err);
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
};

export const getTranslationConfig = async (token: string) => {
    let error = null;
    const res = await fetch(`${TRANSLATE_API_BASE_URL}/config`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        }
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            console.log(err);
            if ('detail' in err) {
                error = err.detail;
            } else {
                error = 'Server connection failed';
            }
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
};

export const updateTranslationConfig = async (token: string, engine: string, enabled: boolean) => {
    let error = null;

    const res = await fetch(`${TRANSLATE_API_BASE_URL}/config/update`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ engine, enabled })
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            console.log(err);
            if ('detail' in err) {
                error = err.detail;
            } else {
                error = 'Server connection failed';
            }
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
};

export const getTranslationEngineUrl = async (token: string) => {
    let error = null;
    const res = await fetch(`${TRANSLATE_API_BASE_URL}/url`, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        }
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            console.log(err);
            if ('detail' in err) {
                error = err.detail;
            } else {
                error = 'Server connection failed';
            }
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
};

export const updateTranslationEngineUrl = async (token: string, config: object = {}) => {
    let error = null;

    const res = await fetch(`${TRANSLATE_API_BASE_URL}/url/update`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...config })
    })
        .then(async (res) => {
            if (!res.ok) throw await res.json();
            return res.json();
        })
        .catch((err) => {
            console.log(err);
            if ('detail' in err) {
                error = err.detail;
            } else {
                error = 'Server connection failed';
            }
            return null;
        });

    if (error) {
        throw error;
    }

    return res;
};