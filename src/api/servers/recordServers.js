import {apiConfig, axiosApi} from "../utils/axiosApi.js";

export default {
    //下载记录
    downloadsRecords(params) {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/downloads/records`,
            method: 'get',
            params,
        })
    },
    //获取授权记录
    pageRecords(params) {
        return axiosApi({
            url: `${apiConfig.deviceManagement}/authorization-records/page`,
            method: 'get',
            params,
        })
    },
}