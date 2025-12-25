import React, { useRef, useMemo, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { OBJLoader } from 'three-stdlib';
import { MTLLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import * as THREE from 'three';
import './navimai.css';

// Componente de Control de Audio
const AudioControl = () => {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
        }

        const playAudio = async () => {
            try {
                if (audioRef.current) {
                    await audioRef.current.play();
                }
            } catch (error) {
                console.log('Autoplay bloqueado, esperando interacción del usuario');
                const handleFirstClick = async () => {
                    try {
                        if (audioRef.current) {
                            await audioRef.current.play();
                        }
                        document.removeEventListener('click', handleFirstClick);
                    } catch (e) {
                        console.log('Error al reproducir:', e);
                    }
                };
                document.addEventListener('click', handleFirstClick);
            }
        };

        playAudio();
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                loop
                preload="auto"
                style={{ display: 'none' }}
            >
                <source src={process.env.PUBLIC_URL + "/audio/cancion.mp3"} type="audio/mpeg" />
                <source src={process.env.PUBLIC_URL + "/audio/cancion.ogg"} type="audio/ogg" />
            </audio>

            <button
                className="audio-control"
                onClick={toggleMute}
                title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
                <img
                    src={isMuted
                        ? process.env.PUBLIC_URL + '/images/volume-mute.png'
                        : process.env.PUBLIC_URL + '/images/medium-volume.png'
                    }
                    alt={isMuted ? 'Sonido desactivado' : 'Sonido activado'}
                    className="audio-icon"
                />
            </button>
        </>
    );
};

// Componente Modal Normal 
const GiftModal = ({ isOpen, onClose, gift }) => {
    if (!isOpen || !gift) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-body">
                    <h2 className="modal-title">{gift.title}</h2>
                    {gift.image && (
                        <img
                            src={gift.image}
                            alt={gift.title}
                            className="modal-image"
                            onError={(e) => {
                                console.error('Error cargando imagen:', gift.image);
                                e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+encontrada';
                            }}
                        />
                    )}
                    <p className="modal-description">{gift.description}</p>
                </div>
            </div>
        </div>
    );
};

// Componente Modal Carta (para regalo morado - gift5)
const LetterModal = ({ isOpen, onClose, gift }) => {
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsChecked(false);
        }
    }, [isOpen]);

    if (!isOpen || !gift) return null;

    const handleToggle = () => {
        setIsChecked(!isChecked);
    };

    const handleOverlayClick = () => {
        setIsChecked(false);
        setTimeout(() => {
            onClose();
        }, 800);
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="letter-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleOverlayClick}>×</button>

                <div className="letter_ct">
                    <input
                        type="checkbox"
                        id="letter-check"
                        checked={isChecked}
                        onChange={handleToggle}
                    />
                    <label htmlFor="letter-check">
                        <span className="letter main"></span>
                        <div className="note">
                            <h2 className="letter-title">{gift.title}</h2>
                            {gift.image && (
                                <img
                                    src={gift.image}
                                    alt={gift.title}
                                    className="letter-image"
                                    onError={(e) => {
                                        console.error('Error cargando imagen:', gift.image);
                                        e.target.src = 'https://via.placeholder.com/300x200/667eea/FFFFFF?text=' + encodeURIComponent(gift.title);
                                    }}
                                />
                            )}
                            <p className="letter-message">{gift.description}</p>
                            <p className="sign">Con amor,<br />Tu Manguito 🥭</p>
                        </div>
                        <span className="front"></span>
                        <span className="letter flap-bg"></span>
                        <span className="letter flap"></span>
                        <span className="heart"></span>
                    </label>
                </div>

                {!isChecked && (
                    <div className="txt">
                        <h3>Click en el sobre 💌</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente de Nieve
const Snow = ({ count = 1000 }) => {
    const mesh = useRef();

    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 40 - 20;
            const y = Math.random() * 40 - 20;
            const z = Math.random() * 40 - 20;
            temp.push({ x, y, z, speed: Math.random() * 0.02 + 0.01 });
        }
        return temp;
    }, [count]);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);
        particles.forEach((particle, i) => {
            positions[i * 3] = particle.x;
            positions[i * 3 + 1] = particle.y;
            positions[i * 3 + 2] = particle.z;
        });
        return positions;
    }, [particles, count]);

    useFrame(() => {
        const positions = mesh.current.geometry.attributes.position.array;

        particles.forEach((particle, i) => {
            positions[i * 3 + 1] -= particle.speed;

            if (positions[i * 3 + 1] < -20) {
                positions[i * 3 + 1] = 20;
            }
        });

        mesh.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particlesPosition.length / 3}
                    array={particlesPosition}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ffffff"
                transparent
                opacity={0.8}
                sizeAttenuation
            />
        </points>
    );
};

const LoadingTree = () => {
    return (
        <mesh position={[0, 0, 0]}>
            <coneGeometry args={[1, 2, 8]} />
            <meshStandardMaterial color="#0F5132" wireframe />
        </mesh>
    );
};

const CustomTreeModel = ({ scale = 1, position = [0, 0, 0] }) => {
    const groupRef = useRef();

    const materials = useLoader(MTLLoader, process.env.PUBLIC_URL + '/models/model.mtl');
    const obj = useLoader(
        OBJLoader,
        process.env.PUBLIC_URL + '/models/model.obj',
        (loader) => {
            materials.preload();
            loader.setMaterials(materials);
        }
    );

    useEffect(() => {
        if (obj) {
            obj.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    if (child.material) {
                        child.material.needsUpdate = true;
                    }
                }
            });
        }
    }, [obj]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={position} scale={scale}>
            <primitive object={obj} />
        </group>
    );
};

const GiftBoxModel = ({ 
  position = [0, 0, 0], 
  scale = 1, 
  rotation = [0, 0, 0],
  colorTint = null,
  onClick = null,
  giftId = ''
}) => {
  const fbx = useLoader(FBXLoader, process.env.PUBLIC_URL + '/models/gift_box_V03.fbx');
  const meshRef = useRef();
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const [diffuseMap, metalnessMap, roughnessMap] = useLoader(
    THREE.TextureLoader,
    [
      process.env.PUBLIC_URL + '/models/gift_box_diffuse.png',
      process.env.PUBLIC_URL + '/models/gift_box_metal.png',
      process.env.PUBLIC_URL + '/models/gift_box_roughress.png'
    ]
  );

  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: diffuseMap,
      metalnessMap: metalnessMap,
      roughnessMap: roughnessMap,
      metalness: 0.5,
      roughness: 0.7,
      color: colorTint || 0xffffff,
    });
  }, [diffuseMap, metalnessMap, roughnessMap, colorTint]);

  const clonedFbx = useMemo(() => {
    const cloned = fbx.clone();
    
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = material.clone();
        child.material.color.set(colorTint || 0xffffff);
      }
    });
    
    return cloned;
  }, [fbx, material, colorTint]);

  useFrame((state) => {
    if (groupRef.current && hovered) {
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.002;
      groupRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (onClick) {
      document.body.style.cursor = 'pointer';
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'default';
  };

  return (
    <group 
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive 
        ref={meshRef}
        object={clonedFbx} 
        scale={scale}
      />
    </group>
  );
};

const GiftsFBX = ({ scale = 1, onGiftClick }) => {
    return (
        <Suspense fallback={null}>
            <group scale={scale}>
                <GiftBoxModel
                    giftId="gift1"
                    position={[0, -1.8, -2]}
                    scale={0.004}
                    rotation={[0, 0, 0]}
                    colorTint="#FF6B6B"
                    onClick={() => onGiftClick('gift1')}
                />

                <GiftBoxModel
                    giftId="gift2"
                    position={[-0.5, -1.8, 2.5]}
                    scale={0.005}
                    rotation={[0, Math.PI / 4, 0]}
                    colorTint="#6B9BFF"
                    onClick={() => onGiftClick('gift2')}
                />

                <GiftBoxModel
                    giftId="gift3"
                    position={[2, -1.5, 1.8]}
                    scale={0.006}
                    rotation={[0, -Math.PI / 6, 0]}
                    colorTint="#6BFF8B"
                    onClick={() => onGiftClick('gift3')}
                />

                <GiftBoxModel
                    giftId="gift4"
                    position={[-2, -1.5, -0.5]}
                    scale={0.007}
                    rotation={[0, Math.PI / 3, 0]}
                    colorTint="#FFD700"
                    onClick={() => onGiftClick('gift4')}
                />

                {/* Regalo 5 - MORADO CON CARTA */}
                <GiftBoxModel
                    giftId="gift5"
                    position={[2, -1.5, -0.8]}
                    scale={0.007}
                    rotation={[0, -Math.PI / 4, 0]}
                    colorTint="#B86BFF"
                    onClick={() => onGiftClick('gift5')}
                />
            </group>
        </Suspense>
    );
};

const Lights = () => {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[10, 10, 5]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4169E1" />
            <pointLight position={[5, 5, 5]} intensity={0.3} color="#FFD700" />
            <pointLight position={[-5, 2, -5]} intensity={0.4} color="#FF6B9D" />
            <spotLight
                position={[0, 10, 0]}
                angle={0.3}
                penumbra={1}
                intensity={0.8}
                castShadow
            />
        </>
    );
};

const Navimai = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [snowCount, setSnowCount] = useState(2000);
    const [cameraPosition, setCameraPosition] = useState([0, 2, 10]);
    const [treeScale, setTreeScale] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [letterOpen, setLetterOpen] = useState(false);
    const [selectedGift, setSelectedGift] = useState(null);

    const giftsData = {
        gift1: {
            title: "Mai, felices fiestas :3",
            image: process.env.PUBLIC_URL + "/images/gift1.png",
            description: "Solo quiero recordarte lo especial que eres para mí. Esta fue la primera vez que nos vimos, y desde ese dia supe que eras para mi <3"
        },
        gift2: {
            title: "Mi ponquecito favorito 💙",
            image: process.env.PUBLIC_URL + "/images/gift2.png",
            description: "Otro recuerdo que siempre tendre es este dia, como te vi, y lo feliz que estabas ese dia :3"
        },
        gift3: {
            title: "Mi corazón siempre sera tuyo 💙",
            image: process.env.PUBLIC_URL + "/images/gift3.png",
            description: "Siempre estare para ti, gracias por ser como eres Mai, me encantas"
        },
        gift4: {
            title: "Feliz Navidad, mi 青 💙",
            image: process.env.PUBLIC_URL + "/images/gift4.png",
            description: "Porque mi corazón lo volviste azul con tu amor :3"
        },
        gift5: {
            title: "💌 Una carta especial para ti 💌",
            image: process.env.PUBLIC_URL + "/images/gift5.png",
            description: "Mai, desde el primer día supe que eras especial. Cada momento contigo es un regalo que atesoro en mi corazón. Gracias por llenar mis días de color azul, el color de nuestro amor. Eres mi alegría, mi inspiración, mi todo. Esta Navidad y siempre, mi corazón es tuyo. Te amo con todo mi ser 💙✨"
        }
    };

    const handleGiftClick = (giftId) => {
        const gift = giftsData[giftId];
        if (gift) {
            setSelectedGift(gift);

            if (giftId === 'gift5') {
                setLetterOpen(true);
            } else {
                setModalOpen(true);
            }
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedGift(null);
    };

    const closeLetter = () => {
        setLetterOpen(false);
        setSelectedGift(null);
    };

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (mobile) {
                setSnowCount(800);
                setCameraPosition([0, 2, 12]);
                setTreeScale(0.8);
            } else {
                setSnowCount(2000);
                setCameraPosition([0, 2, 10]);
                setTreeScale(1);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="christmas-container">
            {/* Control de Audio */}
            <AudioControl />

            <div className="message-overlay">
                {isMobile && (
                    <div className="mobile-hint">
                        👆 Desliza para rotar la escena
                    </div>
                )}
            </div>

            <Canvas
                camera={{ position: cameraPosition, fov: isMobile ? 70 : 60 }}
                style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003366 100%)' }}
                gl={{
                    antialias: !isMobile,
                    powerPreference: isMobile ? 'low-power' : 'high-performance'
                }}
                dpr={isMobile ? [1, 1.5] : [1, 2]}
                shadows
            >
                <Lights />
                <Snow count={snowCount} />

                <Suspense fallback={<LoadingTree />}>
                    <CustomTreeModel
                        scale={treeScale * 0.3}
                        position={[-0.2, -4, 0]}
                    />
                </Suspense>

                <GiftsFBX scale={treeScale} onGiftClick={handleGiftClick} />

                <OrbitControls
                    enableZoom={!isMobile}
                    enablePan={false}
                    minDistance={5}
                    maxDistance={15}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 6}
                    touches={{
                        ONE: THREE.TOUCH.ROTATE,
                        TWO: THREE.TOUCH.DOLLY_PAN
                    }}
                    enableDamping
                    dampingFactor={0.05}
                />

                <Environment preset="night" />
            </Canvas>

            <GiftModal
                isOpen={modalOpen}
                onClose={closeModal}
                gift={selectedGift}
            />

            <LetterModal
                isOpen={letterOpen}
                onClose={closeLetter}
                gift={selectedGift}
            />

            <div className="footer-info">
                {isMobile ? (
                    <p>Desliza para explorar • Toca los regalos</p>
                ) : (
                    <p>Arrastra para rotar • Click en los regalos para abrirlos</p>
                )}
            </div>
        </div>
    );
};

export default Navimai;