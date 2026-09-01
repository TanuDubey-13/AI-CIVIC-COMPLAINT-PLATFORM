<<<<<<< HEAD
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: extract response or format clear error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = {
      status: error.response?.status || 500,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred. Please try again.',
      data: error.response?.data,
    };
    return Promise.reject(customError);
  }
);
=======
import axios from "axios";


const api=axios.create({

baseURL:"http://localhost:5000/api"

});



api.interceptors.request.use(
(config)=>{


const token=
localStorage.getItem("token");


if(token){

config.headers.Authorization=
`Bearer ${token}`;

}


return config;


}
)

>>>>>>> 0488c86f666544cf90ab8d11d465f34d47f64c49

export default api;
