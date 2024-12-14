import React from 'react';

const ContextMenu = ({ contextMenu, options, onClose }) => {
    if (!contextMenu) return null;

    return (
        <div
            className="context-menu"
            style={{
                position: 'absolute',
                top: `${contextMenu.mouseY}px`,
                left: `${contextMenu.mouseX}px`,
                backgroundColor: 'white',
                border: '1px solid gray',
                borderRadius: '5px',
                zIndex: 1000,
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                padding: '8px',
            }}
            onClick={(e) => e.stopPropagation()} // 클릭 이벤트 전파 방지
        >
            {options.map((option, index) => (
                <button
                    key={index}
                    onClick={(e) => {
                        e.stopPropagation(); // 클릭 이벤트 전파 방지
                        option.onClick();
                        onClose(); // 메뉴 닫기
                    }}
                    className="block px-4 py-2 w-full text-left hover:bg-gray-200"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
};

export default ContextMenu;
