import "./supportService.css";
import "./ServiceSearch/ServiceSearch.css";

import React, { useState } from "react";
import FeaturedServiceProvider from "../../components/Supportservices/FeaturedServiceProvider";
import { MdNextPlan } from "react-icons/md";
import {
  BiSolidSkipNextCircle,
  BiSolidSkipPreviousCircle,
} from "react-icons/bi";
import { Link } from "react-router-dom";

export default function ServiceDashboard() {
  return (
    <>
      <section class="py-5 py-xl-8">
        <div class="container">
          <div class="row justify-content-md-center">
            <div class="col-12 col-md-10 col-lg-8 col-xl-7 col-xxl-6">
              <h2 class="mb-4 display-5 text-center">Top Services</h2>
              <p class="text-secondary mb-5 text-center">
                This offers a wide range of services to help tech companies of
                all sizes succeed and specializes in market research, secure
                payments, and 24/7 support.
              </p>
              <hr class="w-50 mx-auto mb-5 mb-xl-9 border-dark-subtle" />
            </div>
          </div>
        </div>

        <div class="container overflow-hidden">
          <div class="row gy-5 gx-md-5 justify-content-center">
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <path d="M18.5 2h-13C3.6 2 2 3.6 2 5.5v13C2 20.4 3.6 22 5.5 22H16l6-6V5.5C22 3.6 20.4 2 18.5 2M20 15h-1.5c-1.9 0-3.5 1.6-3.5 3.5V20H5.8c-1 0-1.8-.8-1.8-1.8V5.8C4 4.8 4.8 4 5.8 4h12.5c1 0 1.8.8 1.8 1.8V15m-4.9-6.8l1.5 1.5-6 6-3.5-3.5 1.5-1.5 2 2 4.5-4.5z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Validation Service
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of Validation Service , Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                  </p>
                  <div>
                    <Link
                      to={"1"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 1024 1024"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <defs>
                      <style />
                    </defs>
                    <path d="M140 188h584v164h76V144c0-17.7-14.3-32-32-32H96c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h544v-76H140V188z" />
                    <path d="M414.3 256h-60.6c-3.4 0-6.4 2.2-7.6 5.4L219 629.4c-.3.8-.4 1.7-.4 2.6 0 4.4 3.6 8 8 8h55.1c3.4 0 6.4-2.2 7.6-5.4L322 540h196.2L422 261.4c-1.3-3.2-4.3-5.4-7.7-5.4zm12.4 228h-85.5L384 360.2 426.7 484zM936 528H800v-93c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v93H592c-13.3 0-24 10.7-24 24v176c0 13.3 10.7 24 24 24h136v152c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V752h136c13.3 0 24-10.7 24-24V552c0-13.3-10.7-24-24-24zM728 680h-88v-80h88v80zm160 0h-88v-80h88v80z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Transalation Service
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of Transalations Services , Lorem
                    ipsum dolor sit amet consectetur adipisicing elit. Quae,
                    dolorum?
                  </p>
                  <div>
                    <Link
                      to={"2"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 001-1v-5.143a1 1 0 00-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 00-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Support Service 3
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of support service 3 , Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                  </p>
                  <div>
                    <Link
                      to={"3"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 001-1v-5.143a1 1 0 00-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 00-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Support Service 4
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of support service 4 , Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                  </p>
                  <div>
                    <Link
                      to={"4"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 001-1v-5.143a1 1 0 00-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 00-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Support Service 5
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of support service 5 , Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                  </p>
                  <div>
                    <Link
                      to={"5"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
              <div class="row gy-4">
                <div class="col-12 col-lg-2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    height="2.2em"
                    width="2.2em"
                    style={{ color: "var(--primary-color)" }}
                  >
                    <path d="M12 2C6.486 2 2 6.486 2 12v4.143C2 17.167 2.897 18 4 18h1a1 1 0 001-1v-5.143a1 1 0 00-1-1h-.908C4.648 6.987 7.978 4 12 4s7.352 2.987 7.908 6.857H19a1 1 0 00-1 1V18c0 1.103-.897 2-2 2h-2v-1h-4v3h6c2.206 0 4-1.794 4-4 1.103 0 2-.833 2-1.857V12c0-5.514-4.486-10-10-10z" />
                  </svg>
                </div>
                <div class="col-12 col-lg-10">
                  <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                    Support Service 6
                  </h4>
                  <p class="mb-3 text-secondary">
                    This is the explaination of support service 5 , Lorem ipsum
                    dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                  </p>
                  <div>
                    <Link
                      to={"6"}
                      class="fw-bold text-decoration-none "
                      style={{ color: "var(--primary-color)" }}
                    >
                      View Service Providers
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-right-short"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div class="row mt-5 ">
        <div className="col-12 text-center mb-5">
          <h3 class="mb-3 display-5">Featured Service Providers </h3>
        </div>
      </div>

      <div class="container overflow-hidden">
        <div class="row gy-5 gx-md-5 justify-content-center">
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  <img
                    src="https://www.freeiconspng.com/uploads/gear-company-logo-brand-png-27.png"
                    width="350"
                    alt="Gear Company Logo Brand PNG"
                    className="profile-image"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  ABC Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of Abc private limited , Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"1"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  <img
                    src="https://www.freeiconspng.com/uploads/logo-design-blank-circle-blue-and-orange-png-2.png"
                    width="350"
                    alt="Gear Company Logo Brand PNG"
                    className="profile-image"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  CBD Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of cbd private limited , Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"2"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  <img
                    src="https://www.freeiconspng.com/uploads/logo-design-icon-symbol-4.png"
                    width="350"
                    alt="Logo Design Icon Symbol"
                    className="profile-image"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  DBC Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of dbc private limited , Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"3"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  <img
                    src="https://www.freeiconspng.com/uploads/pink-blue-logo-design-template-png-6.png"
                    width="350"
                    alt="Pink Blue Logo Design Template Png"
                    className="profile-image"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  XYZ Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of xyz private limited, Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"4"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  <img
                    src="https://www.freeiconspng.com/uploads/circle-green-jx-logo-png-icon-26.png"
                    width="350"
                    alt="Circle Green JX Logo Png Icon"
                    className="profile-image"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  ZYX Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of zyx private limited , Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"5"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div class="col-10 col-md-5 col-xl-4 overflow-hidden">
            <div class="row gy-4">
              <div class="col-12 col-lg-2">
                <div class="profile-container shadow">
                  {/* <img
                    src="https://www.freeiconspng.com/uploads/logo-design-icon-symbol-4.png"
                    width="350"
                    alt="Logo Design Icon Symbol"
                    className="profile-image"
                  /> */}
                </div>
              </div>
              <div class="col-12 col-lg-10">
                <h4 class="mb-3" style={{ color: "var(--primary-color)" }}>
                  ZXQ Private Limited
                </h4>
                <p class="mb-3 text-secondary">
                  This is the explaination of zxq private limited , Lorem ipsum
                  dolor sit amet consectetur adipisicing elit. Quae, dolorum?
                </p>
                <div>
                  <Link
                    to={"6"}
                    class="fw-bold text-decoration-none "
                    style={{ color: "var(--primary-color)" }}
                  >
                    View Services
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-right-short"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
