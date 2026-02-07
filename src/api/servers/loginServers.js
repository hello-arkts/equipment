import {apiConfig, axiosApi} from "../utils/axiosApi.js";

export default {
    //登录
    login(params) {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/auth/login`,
            method: 'post',
            data:params,
        })
    },
    //退出登录
    logout(params) {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/auth/logout`,
            method: 'post',
            data:params,
        })
    },
}