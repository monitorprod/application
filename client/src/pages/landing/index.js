import React, { useContext, useState } from "react";
// import { Grid } from "@material-ui/core";
import ApiContext from "../../api";
import { withStyles } from "../../utils";
// import logo from "./monitorprod.png";
// eslint-disable-next-line no-unused-vars
import LandingCSS from "./home.css";
// eslint-disable-next-line no-unused-vars
import BootstrapCSS from "./bootstrap.min.css";
// eslint-disable-next-line no-unused-vars
import AllCSS from "./all.min.css";
// eslint-disable-next-line no-unused-vars
import AgencyCSS from "./agency.min.css";
import introIMG from "./intro.jpg";
import about1IMG from "./about1.jpg";
import about2IMG from "./about2.jpg";
import about3IMG from "./about3.jpg";
import about4IMG from "./about4.jpg";
import logoPNG from "./logo.png";
import logoDarkPNG from "./logo-dark.png";
import favicon32 from "./favicon-32x32.png";
import favicon16 from "./favicon-16x16.png";
import BackgroundShowcase1 from "./bg-showcase-1.png";
import BackgroundShowcase2 from "./bg-showcase-2.png";
import BackgroundShowcase3 from "./bg-showcase-3.png";

const styles = theme => ({
  grid: {
    height: "100%"
  }
});

const LandingPage = ({ classes, title }) => {
  const client = useContext(ApiContext);
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [success, setSuccess] = useState();
  const [error, setError] = useState();
  const handleChange = ({ target }) => {
    setContact(prev => ({ ...prev, [target.name]: target.value }));
    setSuccess(false);
  };
  const handleSubmit = async () => {
    if (!contact.name || !contact.email || !contact.phone || !contact.message) {
      return setError(true);
    }
    setError(false);
    await client.service("site_contacts").create(contact);
    setSuccess(true);
    setContact({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };
  return (
    // <Grid container direction="column" justify="center" alignItems="center" className={classes.grid}>
    //   {/* <Typography variant="h1">{title}</Typography> */}
    //   <img alt="logo" src={logo} style={{ width: "100%" }} />
    // </Grid>
    <div lang="pt-br" style={{ margin: "-24px" }}>
      <div>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="description" content="" />
        <meta name="author" content="" />
        <link rel="icon" type="image/png" sizes="32x32" href={favicon32} />
        <link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
        <title>MonitorProd</title>
        <link
          href="https://fonts.googleapis.com/css?family=Montserrat:400,700"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Kaushan+Script"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Droid+Serif:400,700,400italic,700italic"
          rel="stylesheet"
          type="text/css"
        />
        <link
          href="https://fonts.googleapis.com/css?family=Roboto+Slab:400,100,300,700"
          rel="stylesheet"
          type="text/css"
        />
        <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" />
      </div>
      <div id="page-top" className="vsc-initialized">
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
          <div className="container">
            <a className="navbar-brand js-scroll-trigger" href="#page-top">
              <img width="182" className="img-fluid d-block mx-auto" src={logoPNG} alt="" />
            </a>
            <button
              className="navbar-toggler navbar-toggler-right"
              type="button"
              data-toggle="collapse"
              data-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              Menu
              <i className="fas fa-bars" />
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav text-uppercase ml-auto">
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#services">
                    MonitorProd
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#tecnologias">
                    Tecnologias
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#about">
                    Sistema
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#contact">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>
        <header className="masthead">
          <div className="container">
            <div className="intro-text">
              <div className="intro-lead-in">Monitoramento de Produção</div>
              <div className="intro-heading text-uppercase" style={{ color: "#e4b535" }}>
                MAIOR DESEMPENHO
                <br />E PRODUTIVIDADE
              </div>
              <a className="btn btn-primary btn-xl text-uppercase js-scroll-trigger" href="#about">
                Como funciona
              </a>
            </div>
          </div>
        </header>
        <section>
          <div className="container">
            <div className="row text-center" style={{ paddingTop: "15px" }}>
              <div className="col-md-4">
                <span className="fa-stack fa-4x">
                  <i className="fas fa-circle fa-stack-2x text-primary" />
                  <i className="fas fa-sitemap fa-stack-1x fa-inverse" />
                </span>
                <h4 className="service-heading">Conexão Inteligente</h4>
                <p className="text-muted">
                  <br />
                  Acesso á qualquer hora, de qualquer lugar, via desktop, tablet ou mobile, sem
                  operador de máquina e compatibilidade em multiplataformas.
                </p>
              </div>
              <div className="col-md-4">
                <span className="fa-stack fa-4x">
                  <i className="fas fa-circle fa-stack-2x text-primary" />
                  <i className="fas fa-laptop fa-stack-1x fa-inverse" />
                </span>
                <h4 className="service-heading">
                  Monitoramento em
                  <br />
                  Tempo Real
                </h4>
                <p className="text-muted">
                  Linha de produção acessível 24/7 com dados em nuvem. Melhor tomada de decisão para
                  investimentos futuros.
                </p>
              </div>
              <div className="col-md-4">
                <span className="fa-stack fa-4x">
                  <i className="fas fa-circle fa-stack-2x text-primary" />
                  <i className="fas fa-tachometer-alt fa-stack-1x fa-inverse" />
                </span>
                <h4 className="service-heading">Melhor Custo-benefício</h4>
                <p className="text-muted">
                  <br />
                  Desenvolvido para a indústria de plástico, fácil operação e instalação via wifi,
                  com custo mais barato que uma hora-máquina.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="services" className="page-section clearfix">
          <div className="container">
            <div className="intro">
              <img className="intro-img img-fluid mb-3 mb-lg-0 rounded" src={introIMG} alt="" />
              <div className="intro-text left-0 text-center bg-faded p-5 rounded">
                <h2 className="section-heading mb-4">
                  <span className="section-heading-lower">Quem Somos</span>
                </h2>
                <p className="mb-3">
                  A monitorProd é uma empresa inovadora na área da tecnologia e adepta do conceito
                  IoT. Com foco no desenvolvimento de sistemas compostos por hardware + software que
                  monitoram a produção de peças plásticas injetadas, sua equipe é formada por
                  profissionais da área de moldes, injeção e de TI.
                </p>
                <div className="intro-button mx-auto">
                  <a className="btn btn-primary btn-xl js-scroll-trigger" href="#contact">
                    Entre em Contato
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="showcase" id="tecnologias">
          <div className="container-fluid p-0">
            <div className="row">
              <div className="col-lg-12 text-center">
                <h2 className="section-heading text-uppercase">Tecnologias</h2>
              </div>
            </div>
            <div className="row no-gutters">
              <div
                className="col-lg-6 order-lg-2 text-white showcase-img"
                style={{
                  backgroundImage:
									`url('${BackgroundShowcase1}')`
                }}
              />
              <div className="col-lg-6 order-lg-1 my-auto showcase-text">
                <h2>Internet of Things</h2>
                <p className="lead mb-0">
                  Com a internet das coisas, os sistemas ciber-físicos comunicam e cooperam entre si
                  e com os humanos em tempo real, e através da computação em nuvem, ambos os
                  serviços internos e intra-organizacionais são oferecidos e utilizados pelos
                  participantes da cadeia de valor.
                </p>
              </div>
            </div>
            <div className="row no-gutters">
              <div
                className="col-lg-6 text-white showcase-img"
                style={{
                  backgroundImage:
									`url('${BackgroundShowcase2}')`
                }}
              />
              <div className="col-lg-6 my-auto showcase-text">
                <h2>Industria 4.0</h2>
                <p className="lead mb-0">
                  A Indústria 4.0 facilita a visão e execução de "Fábricas Inteligentes" com as suas
                  estruturas modulares, os sistemas ciber-físicos monitoram os processos físicos,
                  criam uma cópia virtual do mundo físico e tomam decisões descentralizadas.
                </p>
              </div>
            </div>
            <div className="row no-gutters">
              <div
                className="col-lg-6 order-lg-2 text-white showcase-img"
                style={{
                  backgroundImage:
                    `url('${BackgroundShowcase3}')`
                }}
              />
              <div className="col-lg-6 order-lg-1 my-auto showcase-text">
                <h2>Progressive Web Apps</h2>
                <p className="lead mb-0">
                  MonitorProd pode ser utilizado em computadores, tablets e celulares e usa
                  tecnologia PWA (Progressive Web Apps) o que facilita sua utilização em diversos
                  dispositivos e sistemas operacionais como Windows, macOS, Linux, Android e iOS.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="about" style={{ backgroundColor: "#e9ecef" }}>
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center" style={{ paddingTop: "1rem" }}>
                <h2 className="section-heading text-uppercase">O Sistema</h2>
                <p className="lead mb-0">
                  Ideal para empresas que querem aderir a Indústria 4.0,
                  <br />o sistema desenvolvido pela monitorProd monitora em tempo real os ciclos e
                  as máquinas que estão paradas.
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <ul className="timeline">
                  <li>
                    <div className="timeline-image">
                      <img className="rounded-circle img-fluid" src={about1IMG} alt="" />
                    </div>
                    <div className="timeline-panel">
                      <div className="timeline-body">
                        <p className="lead mb-0">
                          Para isso, conta com um hardware que fica instalado fisicamente na máquina
                          injetora.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="timeline-inverted">
                    <div className="timeline-image">
                      <img className="rounded-circle img-fluid" src={about2IMG} alt="" />
                    </div>
                    <div className="timeline-panel">
                      <div className="timeline-body">
                        <p className="lead mb-0">
                          A cada ciclo, é realizada a captação de um sinal. A diferença entre duas leituras fecha o tempo de um ciclo.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="timeline-image">
                      <img className="rounded-circle img-fluid" src={about3IMG} alt="" />
                    </div>
                    <div className="timeline-panel">
                      <div className="timeline-body">
                        <p className="lead mb-0">
                          Basicamente, num intervalo de 15 minutos, o hardware transfere dados para
                          o servidor em nuvem.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="timeline-inverted">
                    <div className="timeline-image">
                      <img className="rounded-circle img-fluid" src={about4IMG} alt="" />
                    </div>
                    <div className="timeline-panel">
                      <div className="timeline-body">
                        <p className="lead mb-0">
                          Com isso, são gerados cálculos de produtividade, comparando o ciclo real
                          com o ciclo programado.
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="timeline-inverted">
                    <div className="timeline-image">
                      <h4>
                        Venha inovar
                        <br />
                        com a
                        <br />
                        monitorProd
                      </h4>
                    </div>
                    <div className="timeline-panel timeline-panel__last">
                      <div className="timeline-body">
                        <p
                          className="text-muted"
                          style={{
                            fontSize: "1.5rem",
                            lineHeight: "2rem",
                            color: "#000000 !important"
                          }}
                        >
                          Venha inovar com a <b>monitorProd</b>
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section id="contact">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 text-center" style={{ paddingTop: "1rem" }}>
                <h2 className="section-heading text-uppercase" style={{ color: "#fff" }}>Entre em Contato</h2>
                <h5 className="section-subheading text-muted" style={{ color: "#fff" }}>Saiba mais sobre nossos serviços</h5>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12" style={{ paddingTop: "1rem", paddingBottom: "1rem"}}>
                <form id="contactForm" name="sentMessage" noValidate="novalidate">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <input
                          className="form-control"
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Seu nome *"
                          required="required"
                          data-validation-required-message="Por favor insira seu nome."
                          value={contact.name}
                          onChange={handleChange}
                        />
                        <p className="help-block text-danger" />
                      </div>
                      <div className="form-group">
                        <input
                          className="form-control"
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Seu e-mail *"
                          required="required"
                          data-validation-required-message="Por favor insira seu e-mail."
                          value={contact.email}
                          onChange={handleChange}
                        />
                        <p className="help-block text-danger" />
                      </div>
                      <div className="form-group">
                        <input
                          className="form-control"
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Seu telefone *"
                          required="required"
                          data-validation-required-message="Por favor insira um telefone para contato."
                          value={contact.phone}
                          onChange={handleChange}
                        />
                        <p className="help-block text-danger" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <textarea
                          className="form-control"
                          id="message"
                          name="message"
                          placeholder="Sua mensagem *"
                          required="required"
                          data-validation-required-message="Por favor insira uma mensagem."
                          value={contact.message}
                          onChange={handleChange}
                        />
                        <p className="help-block text-danger" />
                      </div>
                    </div>
                    <div className="clearfix" />
                    <div className="col-lg-12 text-center">
                      <div id="success">
                        {success && (
                          <div className="alert alert-success">
                            <button
                              type="button"
                              className="close"
                              data-dismiss="alert"
                              aria-hidden="true"
                            >
                              &times;
                            </button>
                            <strong>Mensagem enviado.</strong>
                          </div>
                        )}
                        {error && (
                          <div className="alert alert-danger">
                            <button
                              type="button"
                              className="close"
                              data-dismiss="alert"
                              aria-hidden="true"
                            >
                              &times;
                            </button>
                            <strong>Todos os campos são de preenchimento obrigatório.</strong>
                          </div>
                        )}
                      </div>
                      <button
                        id="sendMessageButton"
                        className="btn btn-primary btn-xl text-uppercase"
                        type="button"
                        onClick={handleSubmit}
                      >
                        Enviar Mensagem
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="mt-0">
                  <img src={logoDarkPNG} style={{ paddingTop: "100px" }} alt="" />
                </h2>
                <hr className="divider my-4" />
                <a
                  href="https://www.google.com/maps/place/Rua+Valenza,+154,+Colombo+-+PR"
                  className="text-muted mb-5"
                  style={{ color: "#000 !important" }}
                >
                  Rua Valenza, 154 - Alphavile Empresarial <br /> Colombo/PR - CEP 83413-576
                </a>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-4 ml-auto text-center">
                <i
                  className="fas fa-phone fa-3x mb-3 text-muted"
                  style={{ color: "#000 !important" }}
                />
                <a className="d-block" href="tel:+5541991076618">
                  +55 41 9 9107-6618
                </a>
                <a className="d-block" href="tel:+554131136618">
                  +55 41 3113-6618
                </a>
              </div>
              <div className="col-lg-4 mr-auto text-center">
                <i
                  className="fas fa-envelope fa-3x mb-3 text-muted"
                  style={{ color: "#000 !important" }}
                />
                <a
                  className="d-block"
                  href="mailto:contato@monitorprod.com.br"
                  style={{ color: "#000 !important" }}
                >
                  contato@monitorprod.com.br
                </a>
              </div>
            </div>
          </div>
          <footer>
            <div className="container">
              <div className="row">
                <div className="col-md-4">
                  <span className="copyright">Copyright © monitorProd 2019</span>
                </div>
                <div className="col-md-4">
                  <ul className="list-inline social-buttons">
                    <li className="list-inline-item">
                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                      <a href="https://www.facebook.com/monitorProd/" target="_blank">
                        <i className="fab fa-facebook-f" />
                      </a>
                    </li>
                    <li className="list-inline-item">
                      {/* eslint-disable-next-line react/jsx-no-target-blank */}
                      <a href="https://www.linkedin.com/company/monitorprod" target="_blank">
                        <i className="fab fa-linkedin-in" />
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-md-4">
                  {/* eslint-disable-next-line react/jsx-no-target-blank */}
                  <span>
                    Desenvolvido por {/* eslint-disable-next-line react/jsx-no-target-blank */}
                    <a href="http://pierbotteroweb.me" target="_blank">
                      Pier Bottero Web
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </footer>
          <script src="https://pierbotteroweb.bitbucket.io/monitorProd/vendor/jquery/jquery.min.js" />
          <script src="https://pierbotteroweb.bitbucket.io/monitorProd/vendor/bootstrap/js/bootstrap.bundle.min.js" />
          <script src="https://pierbotteroweb.bitbucket.io/monitorProd/vendor/jquery-easing/jquery.easing.min.js" />
          <script src="https://pierbotteroweb.bitbucket.io/monitorProd/js/jqBootstrapValidation.js" />
          <script src="https://pierbotteroweb.bitbucket.io/monitorProd/js/agency.min.js" />
        </section>
      </div>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(LandingPage);
