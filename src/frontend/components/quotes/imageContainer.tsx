/**
 * A functional component to handle the addition and deletion of images in a new and edit quote request.
 */

import { FunctionComponent, useState } from "react";
import { Dictionary, imageFile } from "../../scripts/common";
import { formatFileSize } from "../../scripts/quotes";
import styles from "../../styles/Quotes.module.css";

interface ImageContainerProps {
    photos: Dictionary<imageFile>;
    handleDelete?: Function;
}

const ImageContainer: FunctionComponent<ImageContainerProps> = ({ photos, handleDelete }) => {
    const [enlarge, setEnlarge] = useState("");

    return (
        <>
            {enlarge ? (
                <div className="position-fixed top-0 start-0 bg-black w-100 h-100 bg-opacity-50" onClick={() => setEnlarge("")}>
                    <div
                        className={styles.enlargedImageContainer + " position-fixed top-50 start-50 translate-middle text-center"}
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <div
                            className={styles.enlargeCloseButton + " rounded-circle bg-white text-center py-0 px-2 me-2 mt-2"}
                            onClick={() => setEnlarge("")}
                        >
                            <i className="fa-solid fa-xmark fs-1" />
                        </div>
                        <img src={enlarge} className={styles.enlargeImage + " border border-5"} />
                    </div>
                </div>
            ) : (
                ""
            )}
            <div className="photo-display mt-2 d-flex flex-wrap">
                {Object.keys(photos).map((filename, i) =>
                    photos[filename].status !== "delete" ? (
                        <div className="img-container m-1" key={`img-${i}`}>
                            <img
                                src={photos[filename].url}
                                className={styles.imageTile + " border rounded"}
                                onClick={() => setEnlarge(photos[filename].url)}
                            />
                            {/* display size and delete icon if handleDelete function supplied */}
                            {handleDelete ? (
                                <div className="d-flex justify-content-between">
                                    {formatFileSize(photos[filename].size)}
                                    <span>
                                        <i
                                            className={styles.hoverIcon + " fa-solid fa-trash align-self-center text-dark"}
                                            onClick={() => handleDelete(filename)}
                                        />
                                    </span>
                                </div>
                            ) : (
                                ""
                            )}
                        </div>
                    ) : (
                        ""
                    )
                )}
            </div>
        </>
    );
};

export default ImageContainer;
