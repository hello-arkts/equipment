import {apiConfig, axiosApi} from "../utils/axiosApi.js";

export default {
    //获取客户端信息
    clientInfo() {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/client/info`,
            method: 'get',
        })
    },
    //下载客户端
    clientDownload() {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/client/download`,
            method: 'get',
            responseType: 'blob',
            originalRes: true
        })
    },
    //更新客户端
    clientUpload(data) {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/client/upload`,
            method: 'post',
            data,
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
}