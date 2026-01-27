import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import styles from "./Website.module.css";
import LockerRoom from "../../assets/lockerroom.jpg";
import GymDubble from "../../assets/Gymdubble.jpg";
import Runtrack from "../../assets/runtrack.jpg";
import Badbint from "../../assets/badbint.jpg";
import Coaches from "../../assets/coaches.jpg";
import Trainingpic from "../../assets/trainingpic.jpg";
import Caurosel4 from "../../assets/caurosel4.jpg";
import Caurosel3 from "../../assets/caurosel3.jpg";
import Caurosel2 from "../../assets/caurosel2.jpg";

const Website = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const carouselImages = [
    {
      url: GymDubble,
      title: "Build Your Foundation",
      subtitle: "Elite Training Starts Here",
    },
    {
      url: Caurosel2,
      title: "Accelerate Performance",
      subtitle: "Data-Driven Athletic Excellence",
    },
    {
      url: Caurosel3,
      title: "Sustain Progress",
      subtitle: "Consistent Results Through Science",
    },
    {
      url: Caurosel4,
      title: "Evolve Beyond Limits",
      subtitle: "Your Journey to Greatness",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length,
    );

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.phone && formData.message) {
      alert("Thank you for your message! We will contact you soon.");
      setFormData({ name: "", email: "", phone: "", message: "" });
    } else {
      alert("Please fill in all fields.");
    }
  };

  return (
    <div>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>BASE</div>

          {/* Desktop Menu */}
          <div className={styles.navMenu}>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#coaches">Coaches</a>
            <a href="#programs">Programs</a>
            <a href="#memberships">Memberships</a>
            <a href="#facilities">Facilities</a>
            <a href="#contact">Contact</a>
            <a
              href="https://courtly-client.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Login
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuBtn}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <a href="#home" onClick={() => setMobileMenuOpen(false)}>
              Home
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>
              About
            </a>
            <a href="#coaches" onClick={() => setMobileMenuOpen(false)}>
              Coaches
            </a>
            <a href="#programs" onClick={() => setMobileMenuOpen(false)}>
              Programs
            </a>
            <a href="#memberships" onClick={() => setMobileMenuOpen(false)}>
              Memberships
            </a>
            <a href="#facilities" onClick={() => setMobileMenuOpen(false)}>
              Facilities
            </a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </a>
            <a href="/Baseperformance">Login</a>
          </div>
        )}
      </nav>

      {/* Hero Carousel */}
      <section id="home" className={styles.heroSection}>
        <div className={styles.carouselContainer}>
          {carouselImages.map((image, index) => (
            <div
              key={index}
              className={`${styles.carouselSlide} ${index === currentSlide ? styles.active : styles.inactive}`}
            >
              <img
                src={image.url}
                alt={image.title}
                className={styles.carouselImage}
              />
              <div className={styles.carouselOverlay}>
                <div className={styles.carouselContent}>
                  <h1 className={styles.carouselTitle}>{image.title}</h1>
                  <p className={styles.carouselSubtitle}>{image.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prevSlide}
          className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          onClick={nextSlide}
          className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
        >
          <ChevronRight size={32} />
        </button>

        <div className={styles.carouselDots}>
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`${styles.carouselDot} ${index === currentSlide ? styles.active : ""}`}
            />
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.container}>
          <div className={styles.textCenter}>
            <h2 className={styles.sectionTitle}>
              Welcome to <span className={styles.highlight}>BASE</span>
            </h2>
            <p className={`${styles.sectionSubtitle} ${styles.highlight}`}>
              Build. Accelerate. Sustain. Evolve.
            </p>
          </div>

          <div
            className={`${styles.grid} ${styles.gridCols2} ${styles.alignCenter}`}
          >
            <img
              src={Trainingpic}
              alt="Training"
              className={styles.aboutImage}
            />
            <div>
              <h3 className={styles.aboutTitle}>
                About BASE — The High Performance Centre
              </h3>
              <p className={styles.aboutText}>
                BASE is a world-class High Performance Centre engineered
                exclusively for athletes who demand excellence. At BASE, we help
                you build discipline, accelerate results, sustain progress, and
                evolve your potential — for sport, for life, for you.
              </p>
              <p className={styles.aboutText}>
                Whether you're chasing medals or just a better version of
                yourself, BASE combines elite coaching, cutting-edge facilities,
                and community support to help you perform, recover, and thrive.
              </p>
              <p className={styles.aboutText}>
                Every session at BASE blends biomechanics, sports science, and
                intelligent coaching to ensure your training works smarter — not
                just harder.
              </p>
              <p className={styles.aboutText}>
                From youth prospects to professional athletes, BASE provides the
                structure, expertise, and technology to elevate human
                performance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Coaches Section */}
      <section
        id="coaches"
        className={`${styles.section} ${styles.sectionDarker}`}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Our <span className={styles.highlight}>Coaches</span>
          </h2>
          <div
            className={`${styles.grid} ${styles.gridCols2} ${styles.alignCenter}`}
          >
            <div>
              <p className={`${styles.aboutText} ${styles.mb4}`}>
                Our performance coaches design programs rooted in sports science
                and movement efficiency, with data-led performance monitoring to
                deliver measurable athletic advancement.
              </p>
              <p className={`${styles.aboutText} ${styles.mb4}`}>
                Every rep, sprint, and recovery session serves a purpose. From
                explosive power and speed to stability and endurance, every
                athlete is developed from the ground up — starting with a strong
                BASE.
              </p>
              <p
                className={`${styles.aboutText} ${styles.highlight}`}
                style={{ fontWeight: 600 }}
              >
                The BASE environment reflects a professional performance culture
                — precise, disciplined, and athlete-centred.
              </p>
            </div>
            <img src={Coaches} alt="Coaching" className={styles.aboutImage} />
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section
        id="programs"
        className={`${styles.section} ${styles.sectionDark}`}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Training <span className={styles.highlight}>Programs</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Programs Engineered for Results
          </p>

          <div className={`${styles.grid} ${styles.gridCols3}`}>
            <div className={styles.programCard}>
              <h3 className={styles.programTitle}>
                Athlete Performance Training
              </h3>
              <p className={styles.programDescription}>
                Advanced strength, speed, and conditioning programs designed for
                competitive and semi-pro athletes. Includes testing, data
                tracking, and one-on-one performance coaching.
              </p>
            </div>

            <div className={styles.programCard}>
              <h3 className={styles.programTitle}>General Fitness</h3>
              <p className={styles.programDescription}>
                Dynamic group and personal sessions that improve strength,
                mobility, and endurance for everyday athletes.
              </p>
            </div>

            <div className={styles.programCard}>
              <h3 className={styles.programTitle}>Youth Force Development</h3>
              <p className={styles.programDescription}>
                Age-appropriate training system designed to help young athletes
                (ages 8–18) safely build foundational strength, power, and
                movement skills.
              </p>
            </div>

            <div className={styles.programCard}>
              <h3 className={styles.programTitle}>BASE Running Club</h3>
              <p className={styles.programDescription}>
                Structured track workouts to enhance your pace, technique, and
                stamina, supported by performance coaches.
              </p>
            </div>

            <div className={styles.programCard}>
              <h3 className={styles.programTitle}>Badminton Coaching</h3>
              <p className={styles.programDescription}>
                Skill-based training led by certified coaches, designed for
                players of all levels — from first-time learners to competitive
                athletes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Memberships Section */}
      <section
        id="memberships"
        className={`${styles.section} ${styles.sectionDarker}`}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Choose Your <span className={styles.highlight}>BASE</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Every membership includes access to BASE community events and expert
            support from our coaching team.
          </p>

          <div className={`${styles.grid} ${styles.gridCols3}`}>
            <div
              className={`${styles.membershipCard} ${styles.membershipFitness}`}
            >
              <h3 className={styles.membershipTitle}>Performance</h3>
              <p className={styles.membershipDescription}>
                Full access + personalized coaching & athlete testing
              </p>
              <button className={`${styles.membershipBtn} ${styles.btnWhite}`}>
                Get Started
              </button>
            </div>

            <div
              className={`${styles.membershipCard} ${styles.membershipFitness}`}
            >
              <h3 className={styles.membershipTitle}>Fitness</h3>
              <p className={styles.membershipDescription}>
                Unlimited gym & group class access
              </p>
              <button className={`${styles.membershipBtn} ${styles.btnWhite}`}>
                Get Started
              </button>
            </div>

            <div
              className={`${styles.membershipCard} ${styles.membershipFitness}`}
            >
              <h3 className={styles.membershipTitle}>Court Access</h3>
              <p className={styles.membershipDescription}>
                Book badminton sessions and track time as you train your way
              </p>
              <button className={`${styles.membershipBtn} ${styles.btnWhite}`}>
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section
        id="facilities"
        className={`${styles.section} ${styles.sectionDark}`}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            World-Class <span className={styles.highlight}>Facilities</span>
          </h2>

          <div className={`${styles.grid} ${styles.gridCols2}`}>
            <div className={styles.facilityCard}>
              <img
                src={Badbint}
                alt="Badminton Court"
                className={styles.facilityImage}
              />
              <div className={styles.facilityContent}>
                <h3 className={styles.facilityTitle}>🏸 Badminton Court</h3>
                <p className={styles.facilityDescription}>
                  Indoor, competition-ready courts with advanced lighting and
                  flooring.
                </p>
              </div>
            </div>

            <div className={styles.facilityCard}>
              <img
                src={Runtrack}
                alt="Running Track"
                className={styles.facilityImage}
              />
              <div className={styles.facilityContent}>
                <h3 className={styles.facilityTitle}>
                  🏃 Synthetic Running Track
                </h3>
                <p className={styles.facilityDescription}>
                  Precision-measured track for sprints & drills.
                </p>
              </div>
            </div>

            <div className={styles.facilityCard}>
              <img src={GymDubble} alt="Gym" className={styles.facilityImage} />
              <div className={styles.facilityContent}>
                <h3 className={styles.facilityTitle}>
                  🏋️ High Performance Gym
                </h3>
                <p className={styles.facilityDescription}>
                  Strength & conditioning zones equipped with pro-grade
                  platforms, racks, and sled tracks.
                </p>
              </div>
            </div>

            <div className={styles.facilityCard}>
              <img
                src={LockerRoom}
                alt="Locker Rooms"
                className={styles.facilityImage}
              />
              <div className={styles.facilityContent}>
                <h3 className={styles.facilityTitle}>
                  🚿 Locker Rooms & Showers
                </h3>
                <p className={styles.facilityDescription}>
                  Clean, modern facilities for your comfort and convenience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className={`${styles.section} ${styles.sectionDarker}`}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>
            Get In <span className={styles.highlight}>Touch</span>
          </h2>

          <div className={`${styles.grid} ${styles.gridCols2}`}>
            <div className={styles.contactInfo}>
              <h3 className={styles.contactInfoTitle}>Contact Information</h3>

              <div className={styles.spacingY}>
                <div className={styles.contactInfoItem}>
                  <MapPin className={styles.contactIcon} size={20} />
                  <div>
                    <p className={styles.contactLabel}>Address</p>
                    <p className={styles.contactValue}>
                      123 Performance Drive, Thiruvananthapuram, Kerala
                    </p>
                  </div>
                </div>

                <div className={styles.contactInfoItem}>
                  <Phone className={styles.contactIcon} size={20} />
                  <div>
                    <p className={styles.contactLabel}>Phone</p>
                    <p className={styles.contactValue}>+91 12345 67890</p>
                  </div>
                </div>

                <div className={styles.contactInfoItem}>
                  <Mail className={styles.contactIcon} size={20} />
                  <div>
                    <p className={styles.contactLabel}>Email</p>
                    <p className={styles.contactValue}>
                      info@baseperformance.com
                    </p>
                  </div>
                </div>

                <div className={styles.contactInfoItem}>
                  <Clock className={styles.contactIcon} size={20} />
                  <div>
                    <p className={styles.contactLabel}>Opening Hours</p>
                    <p className={styles.contactValue}>
                      Mon-Fri: 5:00 AM - 10:00 PM
                    </p>
                    <p className={styles.contactValue}>
                      Sat-Sun: 6:00 AM - 8:00 PM
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink}>
                  <Instagram size={24} />
                </a>
                <a href="#" className={styles.socialLink}>
                  <Facebook size={24} />
                </a>
                <a href="#" className={styles.socialLink}>
                  <Twitter size={24} />
                </a>
              </div>
            </div>

            <div>
              <div className={styles.contactForm}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="Your name"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="your.email@example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className={styles.formInput}
                    placeholder="+91 12345 67890"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Message</label>
                  <textarea
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className={styles.formTextarea}
                    placeholder="Tell us about your fitness goals..."
                  ></textarea>
                </div>

                <button onClick={handleSubmit} className={styles.formSubmitBtn}>
                  Send Message
                </button>
              </div>
            </div>
          </div>

          <div className={styles.map}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.6449449!2d76.9!3d8.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMzAnMDAuMCJOIDc2wrA1NCcwMC4wIkU!5e0!3m2!1sen!2sin!4v1234567890"
              className={styles.mapIframe}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerText}>
            &copy; 2025 BASE High Performance Centre. All rights reserved.
          </p>
          <p className={styles.footerTagline}>
            Build. Accelerate. Sustain. Evolve.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Website;
