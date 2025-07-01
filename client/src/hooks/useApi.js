import { useState } from "react";

export default function useApi(apifunc){
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const request = async ()=>{
        setLoading(true);
        try {
            const result = await apifunc(...args);
            setData(result.data);
            return result;
        } catch (err) {
            setError(err.response?.data?.error || err.message)
            throw err;
        }finally{
            setLoading(false);
        }
    };

    return {data, error, loading, request}
}