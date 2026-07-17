import { useState } from "react";
import { AVAILABLE_AVATARS } from "../../Data/avatars";
import "./AvatarSelector.css";

const AvatarSelector = ({ selectedAvatar, onChange }) => {

    const [isOpen, setIsOpen] = useState(false);
    const currentAvatar =
        AVAILABLE_AVATARS.find(a => a.url === selectedAvatar)
        || AVAILABLE_AVATARS[0];
    return (
        <div className="avatar-selector">
            <label className="avatar-selector-label">
                Personaje
            </label>
            <div
                className="avatar-selector-btn"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="avatar-selector-current">
                    <img
                        src={currentAvatar.url}
                        alt={currentAvatar.name}
                    />
                    <span>
                        {currentAvatar.name}
                    </span>
                </div>
                <span
                    className={`avatar-selector-arrow ${isOpen ? "open" : ""}`}
                >
                    ▼
                </span>
            </div>
            {
                isOpen &&
                <div className="avatar-selector-menu">
                    {
                        AVAILABLE_AVATARS.map((avatar) => (
                            <div
                                key={avatar.id}
                                className={`avatar-selector-item ${
                                    selectedAvatar === avatar.url ? "selected" : ""
                                }`}
                                onClick={() => {
                                    onChange(avatar.url);
                                    setIsOpen(false);
                                }}
                            >
                                <img
                                    src={avatar.url}
                                    alt={avatar.name}
                                />
                                <span>
                                    {avatar.name}
                                </span>
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    );

};

export default AvatarSelector;