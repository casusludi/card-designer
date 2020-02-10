

import settings from '../../settings/globals.json';
import { makeAuthManager } from './services/Auth';

const getAuth = makeAuthManager(settings);


export default {
    getAuth,
    settings
}