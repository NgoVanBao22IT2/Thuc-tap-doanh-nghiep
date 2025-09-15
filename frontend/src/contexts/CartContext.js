import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

// Tạo key duy nhất cho sản phẩm + size (di chuyển ra ngoài component)
const getCartItemKey = (productId, selectedSize) => {
  return selectedSize ? `${productId}_${selectedSize.id}` : `${productId}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log("Parsed cart from localStorage:", parsedCart);

        // Đảm bảo tương thích với dữ liệu cũ
        const normalizedCart = parsedCart.map((item) => {
          // Nếu item chưa có cartKey, tạo mới
          if (!item.cartKey) {
            const cartKey = getCartItemKey(item.id, item.selectedSize);
            console.log(
              "Creating cartKey for item:",
              item.id,
              "size:",
              item.selectedSize,
              "key:",
              cartKey
            );
            return { ...item, cartKey };
          }
          console.log("Item already has cartKey:", item.cartKey);
          return item;
        });

        console.log("Normalized cart:", normalizedCart);
        setCartItems(normalizedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage:", error);
        localStorage.removeItem("cart");
        setCartItems([]);
      }
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Chỉ save khi đã initialized để tránh ghi đè dữ liệu ban đầu
    if (isInitialized) {
      console.log("Saving cart to localStorage:", cartItems);
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    console.log(
      "Adding to cart:",
      product.id,
      "quantity:",
      quantity,
      "size:",
      selectedSize
    ); // Debug log

    setCartItems((prevItems) => {
      const cartKey = getCartItemKey(product.id, selectedSize);
      console.log("Generated cartKey:", cartKey); // Debug log

      const existingItem = prevItems.find((item) => {
        const itemKey =
          item.cartKey || getCartItemKey(item.id, item.selectedSize);
        console.log("Comparing cartKey:", cartKey, "with itemKey:", itemKey); // Debug log
        return itemKey === cartKey;
      });

      if (existingItem) {
        console.log("Found existing item, updating quantity"); // Debug log
        return prevItems.map((item) => {
          const itemKey =
            item.cartKey || getCartItemKey(item.id, item.selectedSize);
          return itemKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        console.log("Adding new item to cart"); // Debug log
        return [
          ...prevItems,
          {
            ...product,
            quantity,
            selectedSize,
            cartKey,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, selectedSize = null) => {
    const cartKey = getCartItemKey(productId, selectedSize);
    setCartItems((prevItems) =>
      prevItems.filter((item) => {
        const itemKey =
          item.cartKey || getCartItemKey(item.id, item.selectedSize);
        return itemKey !== cartKey;
      })
    );
  };

  const updateQuantity = (productId, quantity, selectedSize = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }

    const cartKey = getCartItemKey(productId, selectedSize);
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const itemKey =
          item.cartKey || getCartItemKey(item.id, item.selectedSize);
        return itemKey === cartKey ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
