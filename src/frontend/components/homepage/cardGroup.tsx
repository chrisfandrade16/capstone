/**
 * A container of cards used on the application's landing page when a user is not signed in
 */

import Container from "react-bootstrap/Container";
import Carousel from "react-bootstrap/Carousel";
import styles from "../../styles/Homepage.module.css";

const SplashCardGrid = () => {
    return (
        <>
            <Container className="mt-4 shadow">
                <Carousel fade interval={6000}>
                    <Carousel.Item>
                        <img className="d-block w-100 rounded" src="brakeDisc_ws.jpg" alt="First slide" />
                        <Carousel.Caption>
                            <div className={styles.carouselBackground + " carousel-background px-3 py-2 rounded text-dark"}>
                                <h3>Get Quotes Fast</h3>
                                <p>
                                    Request quotes from multiple shops simultaneously while only filling out a single form, letting you save hours of
                                    work and focus on the important decisions
                                </p>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img className="d-block w-100 rounded" src="shop_exterior_ws.jpg" alt="Second slide" />

                        <Carousel.Caption>
                            <div className={styles.carouselBackground + " carousel-background px-3 py-2 rounded text-dark"}>
                                <h3>Find Providers</h3>
                                <p>
                                    Sayyara makes it easy to find the right shop for you, with location-based search and summaries of provided
                                    services
                                </p>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img className="d-block w-100 rounded" src="car-engine-oil-auto_ws.jpg" alt="Third slide" />

                        <Carousel.Caption>
                            <div className={styles.carouselBackground + " carousel-background px-3 py-2 rounded text-dark"}>
                                <h3>Book Appointments</h3>
                                <p>Negotiate with service providers in real-time or automatically schedule routine maintenance in one click</p>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>
                    <Carousel.Item>
                        <img className="d-block w-100 rounded" src="blue-car_ws.jpg" alt="Third slide" />

                        <Carousel.Caption>
                            <div className={styles.carouselBackground + " carousel-background px-3 py-2 rounded text-dark"}>
                                <h3>Stay Organized</h3>
                                <p>Keep track of your vehicles, their maintenance status, and reserved appointments all in one convenient place</p>
                            </div>
                        </Carousel.Caption>
                    </Carousel.Item>
                </Carousel>
            </Container>
        </>
    );
};

export default SplashCardGrid;