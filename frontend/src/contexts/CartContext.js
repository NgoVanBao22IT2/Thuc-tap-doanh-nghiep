import React, { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

// Tạo key duy nhất cho sản phẩm + size
const getCartItemKey = (productId, selectedSize) => {
  return selectedSize ? `${productId}_${selectedSize.id}` : `${productId}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentUser } = useAuth();

  // Tạo key cho localStorage dựa trên user ID
  const getCartStorageKey = (userId) => {
    return userId ? `cart_user_${userId}` : "cart_guest";
  };

  // Load cart từ localStorage khi component mount hoặc user thay đổi
  useEffect(() => {
    console.log("User changed, loading cart for:", currentUser?.id || "guest");
    loadCartFromStorage();
  }, [currentUser?.id]);

  // Save cart vào localStorage khi cartItems thay đổi
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage();
    }
  }, [cartItems, isInitialized, currentUser?.id]);

  const loadCartFromStorage = () => {
    try {
      const storageKey = getCartStorageKey(currentUser?.id);
      const savedCart = localStorage.getItem(storageKey);

      console.log(
        `Loading cart for user ${currentUser?.id || "guest"}:`,
        savedCart
          ? `Found ${JSON.parse(savedCart).length} items`
          : "No cart found"
      );

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        // Đảm bảo tương thích với dữ liệu cũ
        const normalizedCart = parsedCart.map((item) => {
          if (!item.cartKey) {
            const cartKey = getCartItemKey(item.id, item.selectedSize);
            return { ...item, cartKey };
          }
          return item;
        });

        setCartItems(normalizedCart);
        console.log(
          `Successfully loaded ${normalizedCart.length} items for user ${
            currentUser?.id || "guest"
          }`
        );
      } else {
        // Không có cart đã lưu - bắt đầu với cart rỗng
        setCartItems([]);
        console.log(
          `No saved cart found for user ${
            currentUser?.id || "guest"
          } - starting with empty cart`
        );
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCartItems([]);
    } finally {
      setIsInitialized(true);
    }
  };

  const saveCartToStorage = () => {
    try {
      const storageKey = getCartStorageKey(currentUser?.id);
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
      console.log(
        `Cart saved for user ${currentUser?.id || "guest"}:`,
        cartItems.length,
        "items"
      );
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  };

  // Migrate cart từ guest sang user KHI LOGIN (không chạy khi logout)
  const migrateGuestCartToUser = () => {
    if (!currentUser?.id) {
      console.log("No user to migrate to, skipping migration");
      return;
    }

    const guestStorageKey = getCartStorageKey(null);
    const userStorageKey = getCartStorageKey(currentUser.id);

    try {
      const guestCart = localStorage.getItem(guestStorageKey);
      const userCart = localStorage.getItem(userStorageKey);

      console.log("Migration check:", {
        hasGuestCart: !!guestCart,
        hasUserCart: !!userCart,
        userId: currentUser.id,
        guestItems: guestCart ? JSON.parse(guestCart).length : 0,
        userItems: userCart ? JSON.parse(userCart).length : 0,
      });

      if (guestCart && !userCart) {
        // Case 1: Có guest cart, chưa có user cart -> Migrate toàn bộ
        localStorage.setItem(userStorageKey, guestCart);
        localStorage.removeItem(guestStorageKey);
        console.log(`✅ Migrated guest cart to user ${currentUser.id}`);
        loadCartFromStorage(); // Reload để hiển thị cart đã migrate
      } else if (guestCart && userCart) {
        // Case 2: Có cả guest cart và user cart -> Merge
        try {
          const guestItems = JSON.parse(guestCart);
          const userItems = JSON.parse(userCart);

          console.log(
            `🔄 Merging carts: ${guestItems.length} guest + ${userItems.length} user items`
          );

          const mergedItems = [...userItems];

          guestItems.forEach((guestItem) => {
            const guestCartKey =
              guestItem.cartKey ||
              getCartItemKey(guestItem.id, guestItem.selectedSize);
            const existingItem = mergedItems.find(
              (item) =>
                (item.cartKey || getCartItemKey(item.id, item.selectedSize)) ===
                guestCartKey
            );

            if (!existingItem) {
              // Sản phẩm chưa có trong user cart -> Thêm mới
              mergedItems.push(guestItem);
              console.log(
                `➕ Added new item: ${guestItem.name} ${
                  guestItem.selectedSize?.name || ""
                }`
              );
            } else {
              // Sản phẩm đã có -> Cộng dồn quantity
              existingItem.quantity += guestItem.quantity;
              console.log(
                `🔢 Merged quantities for: ${guestItem.name} ${
                  guestItem.selectedSize?.name || ""
                }`
              );
            }
          });

          localStorage.setItem(userStorageKey, JSON.stringify(mergedItems));
          localStorage.removeItem(guestStorageKey);
          console.log(
            `✅ Merged cart completed: ${mergedItems.length} total items`
          );
          loadCartFromStorage(); // Reload để hiển thị cart đã merge
        } catch (mergeError) {
          console.error("❌ Error merging carts:", mergeError);
        }
      } else if (userCart) {
        // Case 3: Chỉ có user cart -> Không cần migrate, chỉ remove guest cart
        if (guestCart) localStorage.removeItem(guestStorageKey);
        console.log(`✅ User cart loaded, guest cart cleared`);
      } else {
        // Case 4: Không có cart nào -> Không cần làm gì
        console.log(`ℹ️ No carts to migrate`);
      }
    } catch (error) {
      console.error("❌ Error migrating guest cart:", error);
    }
  };

  // Track user changes để chỉ migrate khi login (không migrate khi logout)
  const [previousUserId, setPreviousUserId] = useState(undefined);

  useEffect(() => {
    if (isInitialized) {
      const currentUserId = currentUser?.id || null;

      console.log("User state change:", {
        previousUserId,
        currentUserId,
        isLogin: !previousUserId && currentUserId,
        isLogout: previousUserId && !currentUserId,
        isSwitchUser:
          previousUserId && currentUserId && previousUserId !== currentUserId,
      });

      // CHỈ migrate khi:
      // 1. User login (từ guest thành có user)
      // 2. User switch (từ user này sang user khác)
      if (
        (!previousUserId && currentUserId) ||
        (previousUserId && currentUserId && previousUserId !== currentUserId)
      ) {
        console.log("🔄 Triggering cart migration...");
        setTimeout(() => {
          migrateGuestCartToUser();
        }, 100); // Delay nhỏ để đảm bảo loadCartFromStorage đã hoàn thành
      }

      // KHÔNG làm gì khi logout (previousUserId && !currentUserId)
      // Cart của user đã được lưu và sẽ được load lại khi login

      setPreviousUserId(currentUserId);
    }
  }, [currentUser?.id, isInitialized]);

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    console.log(
      "Adding to cart:",
      product.id,
      "quantity:",
      quantity,
      "size:",
      selectedSize,
      "for user:",
      currentUser?.id || "guest"
    );

    setCartItems((prevItems) => {
      const cartKey = getCartItemKey(product.id, selectedSize);

      const existingItem = prevItems.find((item) => {
        const itemKey =
          item.cartKey || getCartItemKey(item.id, item.selectedSize);
        return itemKey === cartKey;
      });

      if (existingItem) {
        console.log("Found existing item, updating quantity");
        return prevItems.map((item) => {
          const itemKey =
            item.cartKey || getCartItemKey(item.id, item.selectedSize);
          return itemKey === cartKey
            ? { ...item, quantity: item.quantity + quantity }
            : item;
        });
      } else {
        console.log("Adding new item to cart");
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

  // Clear cart - CHỈ sau khi đặt hàng thành công
  const clearCart = () => {
    setCartItems([]);
    console.log(
      `🛒 Cart cleared for user ${
        currentUser?.id || "guest"
      } after successful order`
    );
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
