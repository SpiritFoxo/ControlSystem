import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import api from "../api/axiosInstance";
import styles from '../css/LoginPage.module.css';

const LoginPage = () => {


    return (
        <div className={styles.background}>
            <div className={styles.loginContainer}>
                <h2>Войдите в свой аккаунт</h2>
                <form>
                    <div className={styles.formGroup}>
                        <input type="text" id="username" name="username" required placeholder="Email"/>
                    </div>
                    <div className={styles.formGroup}>
                        <input type="password" id="password" name="password" required placeholder="Пароль"/>
                    </div>
                    <button type="submit" className={styles.loginButton}>Войти</button>
                </form>
            </div>
        </div>
    );
}

export default LoginPage;