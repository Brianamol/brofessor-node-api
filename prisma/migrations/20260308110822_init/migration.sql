-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isSeller` BOOLEAN NOT NULL DEFAULT false,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seller_profiles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NOT NULL,
    `businessType` VARCHAR(191) NULL,
    `kraPin` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `logoUrl` VARCHAR(191) NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    `totalSales` INTEGER NOT NULL DEFAULT 0,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `seller_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `addresses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `line1` VARCHAR(191) NOT NULL,
    `line2` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `county` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `description` TEXT NULL,
    `iconUrl` VARCHAR(191) NULL,
    `bannerUrl` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 1,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `parentId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    INDEX `categories_parentId_idx`(`parentId`),
    INDEX `categories_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(60) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(280) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `shortDesc` VARCHAR(500) NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `comparePrice` DECIMAL(12, 2) NULL,
    `costPrice` DECIMAL(12, 2) NULL,
    `categoryId` INTEGER NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'ACTIVE', 'PAUSED', 'OUT_OF_STOCK', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `condition` ENUM('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS_ONLY') NOT NULL DEFAULT 'NEW',
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isDigital` BOOLEAN NOT NULL DEFAULT false,
    `weight` DECIMAL(8, 3) NULL,
    `length` DECIMAL(8, 2) NULL,
    `width` DECIMAL(8, 2) NULL,
    `height` DECIMAL(8, 2) NULL,
    `freeShipping` BOOLEAN NOT NULL DEFAULT false,
    `viewCount` INTEGER NOT NULL DEFAULT 0,
    `soldCount` INTEGER NOT NULL DEFAULT 0,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_sku_key`(`sku`),
    UNIQUE INDEX `products_slug_key`(`slug`),
    INDEX `products_categoryId_idx`(`categoryId`),
    INDEX `products_sellerId_idx`(`sellerId`),
    INDEX `products_status_idx`(`status`),
    INDEX `products_slug_idx`(`slug`),
    FULLTEXT INDEX `products_name_description_shortDesc_idx`(`name`, `description`, `shortDesc`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `publicId` VARCHAR(191) NOT NULL,
    `alt` VARCHAR(191) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `product_images_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `price` DECIMAL(12, 2) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `options` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    INDEX `product_variants_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NULL,
    `variantId` INTEGER NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `reserved` INTEGER NOT NULL DEFAULT 0,
    `lowStock` INTEGER NOT NULL DEFAULT 5,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventory_productId_key`(`productId`),
    UNIQUE INDEX `inventory_variantId_key`(`variantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attributes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,

    INDEX `product_attributes_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `slug` VARCHAR(60) NOT NULL,

    UNIQUE INDEX `tags_name_key`(`name`),
    UNIQUE INDEX `tags_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_tags` (
    `productId` INTEGER NOT NULL,
    `tagId` INTEGER NOT NULL,

    PRIMARY KEY (`productId`, `tagId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `buyerId` VARCHAR(191) NOT NULL,
    `addressId` INTEGER NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'DISPUTED') NOT NULL DEFAULT 'PENDING',
    `paymentStatus` ENUM('UNPAID', 'PENDING', 'PAID', 'PARTIALLY_PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'UNPAID',
    `subtotal` DECIMAL(12, 2) NOT NULL,
    `shippingFee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `discount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `total` DECIMAL(12, 2) NOT NULL,
    `couponCode` VARCHAR(191) NULL,
    `couponDiscount` DECIMAL(12, 2) NULL,
    `buyerNote` TEXT NULL,
    `sellerNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `orders_orderNumber_key`(`orderNumber`),
    INDEX `orders_buyerId_idx`(`buyerId`),
    INDEX `orders_status_idx`(`status`),
    INDEX `orders_paymentStatus_idx`(`paymentStatus`),
    INDEX `orders_orderNumber_idx`(`orderNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `variantId` INTEGER NULL,
    `productName` VARCHAR(191) NOT NULL,
    `variantName` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(12, 2) NOT NULL,
    `totalPrice` DECIMAL(12, 2) NOT NULL,

    INDEX `order_items_orderId_idx`(`orderId`),
    INDEX `order_items_productId_idx`(`productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_status_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'DISPUTED') NOT NULL,
    `note` VARCHAR(191) NULL,
    `changedBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `order_status_history_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `method` ENUM('MPESA', 'CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY') NOT NULL,
    `status` ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT') NOT NULL DEFAULT 'INITIATED',
    `amount` DECIMAL(12, 2) NOT NULL,
    `mpesaCheckoutId` VARCHAR(191) NULL,
    `mpesaMpesaReceiptNo` VARCHAR(191) NULL,
    `mpesaPhoneNumber` VARCHAR(191) NULL,
    `mpesaResultCode` INTEGER NULL,
    `mpesaResultDesc` VARCHAR(191) NULL,
    `rawCallback` JSON NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_mpesaCheckoutId_key`(`mpesaCheckoutId`),
    UNIQUE INDEX `payments_mpesaMpesaReceiptNo_key`(`mpesaMpesaReceiptNo`),
    INDEX `payments_orderId_idx`(`orderId`),
    INDEX `payments_mpesaCheckoutId_idx`(`mpesaCheckoutId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rating` INTEGER NOT NULL,
    `title` VARCHAR(150) NULL,
    `body` TEXT NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isApproved` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `reviews_productId_idx`(`productId`),
    UNIQUE INDEX `reviews_productId_userId_key`(`productId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `wishlist_items_userId_productId_key`(`userId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(30) NOT NULL,
    `type` ENUM('PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING') NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `minOrderAmount` DECIMAL(12, 2) NULL,
    `maxUses` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `expiresAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `coupons_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_zones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `counties` JSON NOT NULL,
    `baseFee` DECIMAL(8, 2) NOT NULL,
    `perKgFee` DECIMAL(8, 2) NULL,
    `freeAbove` DECIMAL(12, 2) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `estDays` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `seller_profiles` ADD CONSTRAINT `seller_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `addresses` ADD CONSTRAINT `addresses_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `categories` ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `inventory_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attributes` ADD CONSTRAINT `product_attributes_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_tags` ADD CONSTRAINT `product_tags_tagId_fkey` FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_addressId_fkey` FOREIGN KEY (`addressId`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_status_history` ADD CONSTRAINT `order_status_history_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
