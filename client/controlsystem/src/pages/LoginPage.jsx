import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import api from "../api/axiosInstance";
import '../css/LoginPage.css';

const LoginPage = () => {


    return (
        <div className="background">
            <div className="login-container">
                <h2>Войдите в свой аккаунт</h2>
                <form>
                    <div className="form-group">
                        <input type="text" id="username" name="username" required placeholder="Email"/>
                    </div>
                    <div className="form-group">
                        <input type="password" id="password" name="password" required placeholder="Пароль"/>
                    </div>
                    <button type="submit" className="login-button">Войти</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;