
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "addresses": {
                  Row: {
                    "city_id": number,"created_at": string,"details": string,"id": number,"is_default": boolean,"label": string,"phone": string,"recipient_name": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city_id": number,"created_at"?: string,"details": string,"id"?: never,"is_default"?: boolean,"label"?: string,"phone": string,"recipient_name": string,"user_id": string
                  }
                  Update: {
                    "city_id"?: number,"created_at"?: string,"details"?: string,"id"?: never,"is_default"?: boolean,"label"?: string,"phone"?: string,"recipient_name"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "addresses_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "addresses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"banners": {
                  Row: {
                    "button_label": string | null,"created_at": string,"id": number,"image_path": string,"is_active": boolean,"link_url": string | null,"sort_order": number,"subtitle": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "button_label"?: string | null,"created_at"?: string,"id"?: never,"image_path": string,"is_active"?: boolean,"link_url"?: string | null,"sort_order"?: number,"subtitle"?: string | null,"title": string
                  }
                  Update: {
                    "button_label"?: string | null,"created_at"?: string,"id"?: never,"image_path"?: string,"is_active"?: boolean,"link_url"?: string | null,"sort_order"?: number,"subtitle"?: string | null,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"brands": {
                  Row: {
                    "created_at": string,"id": number,"is_active": boolean,"logo_path": string | null,"name": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"is_active"?: boolean,"logo_path"?: string | null,"name": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"is_active"?: boolean,"logo_path"?: string | null,"name"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"cart_items": {
                  Row: {
                    "cart_id": string,"created_at": string,"product_id": number,"quantity": number
                  }
                  ComputedFields: never
                  Insert: {
                    "cart_id": string,"created_at"?: string,"product_id": number,"quantity": number
                  }
                  Update: {
                    "cart_id"?: string,"created_at"?: string,"product_id"?: number,"quantity"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "cart_items_cart_id_fkey"
      columns: ["cart_id"]
isOneToOne: false
      referencedRelation: "carts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"carts": {
                  Row: {
                    "id": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "id"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "carts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: true
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "created_at": string,"description": string | null,"icon": string,"id": number,"is_active": boolean,"name": string,"parent_id": number | null,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"icon"?: string,"id"?: never,"is_active"?: boolean,"name": string,"parent_id"?: number | null,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"icon"?: string,"id"?: never,"is_active"?: boolean,"name"?: string,"parent_id"?: number | null,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"cities": {
                  Row: {
                    "delivery_days": string | null,"delivery_fee": number,"id": number,"is_active": boolean,"name": string,"sort_order": number,"vanex_city_id": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "delivery_days"?: string | null,"delivery_fee"?: number,"id"?: never,"is_active"?: boolean,"name": string,"sort_order"?: number,"vanex_city_id"?: number | null
                  }
                  Update: {
                    "delivery_days"?: string | null,"delivery_fee"?: number,"id"?: never,"is_active"?: boolean,"name"?: string,"sort_order"?: number,"vanex_city_id"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"coupons": {
                  Row: {
                    "code": string,"created_at": string,"expires_at": string | null,"id": number,"is_active": boolean,"max_discount": number | null,"min_subtotal": number,"starts_at": string | null,"type": Database["public"]['Enums']["coupon_type"],"usage_limit": number | null,"used_count": number,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string,"expires_at"?: string | null,"id"?: never,"is_active"?: boolean,"max_discount"?: number | null,"min_subtotal"?: number,"starts_at"?: string | null,"type": Database["public"]['Enums']["coupon_type"],"usage_limit"?: number | null,"used_count"?: number,"value": number
                  }
                  Update: {
                    "code"?: string,"created_at"?: string,"expires_at"?: string | null,"id"?: never,"is_active"?: boolean,"max_discount"?: number | null,"min_subtotal"?: number,"starts_at"?: string | null,"type"?: Database["public"]['Enums']["coupon_type"],"usage_limit"?: number | null,"used_count"?: number,"value"?: number
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "id": number,"image_path": string | null,"line_total": number,"order_id": string,"product_id": number | null,"product_name": string,"product_slug": string | null,"quantity": number,"unit_cost": number,"unit_price": number,"unit_sale_price": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: never,"image_path"?: string | null,"line_total": number,"order_id": string,"product_id"?: number | null,"product_name": string,"product_slug"?: string | null,"quantity": number,"unit_cost"?: number,"unit_price": number,"unit_sale_price": number
                  }
                  Update: {
                    "id"?: never,"image_path"?: string | null,"line_total"?: number,"order_id"?: string,"product_id"?: number | null,"product_name"?: string,"product_slug"?: string | null,"quantity"?: number,"unit_cost"?: number,"unit_price"?: number,"unit_sale_price"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "address": string,"city_id": number | null,"city_name": string,"cost_total": number,"coupon_code": string | null,"coupon_discount": number,"coupon_id": number | null,"created_at": string,"customer_name": string,"delivery_fee": number,"id": string,"notes": string | null,"order_number": string,"payment_method": Database["public"]['Enums']["payment_method"],"phone": string,"product_discount": number,"status": Database["public"]['Enums']["order_status"],"subtotal": number,"total": number,"updated_at": string,"user_id": string | null,"vanex_tracking": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address": string,"city_id"?: number | null,"city_name": string,"cost_total"?: number,"coupon_code"?: string | null,"coupon_discount"?: number,"coupon_id"?: number | null,"created_at"?: string,"customer_name": string,"delivery_fee"?: number,"id"?: string,"notes"?: string | null,"order_number"?: string,"payment_method": Database["public"]['Enums']["payment_method"],"phone": string,"product_discount": number,"status"?: Database["public"]['Enums']["order_status"],"subtotal": number,"total": number,"updated_at"?: string,"user_id"?: string | null,"vanex_tracking"?: string | null
                  }
                  Update: {
                    "address"?: string,"city_id"?: number | null,"city_name"?: string,"cost_total"?: number,"coupon_code"?: string | null,"coupon_discount"?: number,"coupon_id"?: number | null,"created_at"?: string,"customer_name"?: string,"delivery_fee"?: number,"id"?: string,"notes"?: string | null,"order_number"?: string,"payment_method"?: Database["public"]['Enums']["payment_method"],"phone"?: string,"product_discount"?: number,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"total"?: number,"updated_at"?: string,"user_id"?: string | null,"vanex_tracking"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_city_id_fkey"
      columns: ["city_id"]
isOneToOne: false
      referencedRelation: "cities"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"product_images": {
                  Row: {
                    "alt": string | null,"created_at": string,"id": number,"path": string,"product_id": number,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"created_at"?: string,"id"?: never,"path": string,"product_id": number,"sort_order"?: number
                  }
                  Update: {
                    "alt"?: string | null,"created_at"?: string,"id"?: never,"path"?: string,"product_id"?: number,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "brand_id": number | null,"category_id": number | null,"cost_price": number | null,"created_at": string,"description": string | null,"discount_percent": number,"id": number,"is_active": boolean,"is_featured": boolean,"name": string,"offer_ends_at": string | null,"price": number,"rating_avg": number,"rating_count": number,"sale_price": number | null,"search_text": string | null,"sku": string | null,"slug": string,"sold_count": number,"specs": NonNullable<Json>,"stock": number,"updated_at": string,"warranty_months": number
                  }
                  ComputedFields: never
                  Insert: {
                    "brand_id"?: number | null,"category_id"?: number | null,"cost_price"?: number | null,"created_at"?: string,"description"?: string | null,"discount_percent"?: number,"id"?: never,"is_active"?: boolean,"is_featured"?: boolean,"name": string,"offer_ends_at"?: string | null,"price": number,"rating_avg"?: number,"rating_count"?: number,"sale_price"?: never,"search_text"?: never,"sku"?: string | null,"slug": string,"sold_count"?: number,"specs"?: NonNullable<Json>,"stock"?: number,"updated_at"?: string,"warranty_months"?: number
                  }
                  Update: {
                    "brand_id"?: number | null,"category_id"?: number | null,"cost_price"?: number | null,"created_at"?: string,"description"?: string | null,"discount_percent"?: number,"id"?: never,"is_active"?: boolean,"is_featured"?: boolean,"name"?: string,"offer_ends_at"?: string | null,"price"?: number,"rating_avg"?: number,"rating_count"?: number,"sale_price"?: never,"search_text"?: never,"sku"?: string | null,"slug"?: string,"sold_count"?: number,"specs"?: NonNullable<Json>,"stock"?: number,"updated_at"?: string,"warranty_months"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_brand_id_fkey"
      columns: ["brand_id"]
isOneToOne: false
      referencedRelation: "brands"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"phone": string | null,"role": Database["public"]['Enums']["user_role"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"phone"?: string | null,"role"?: Database["public"]['Enums']["user_role"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reviews": {
                  Row: {
                    "author_name": string,"comment": string | null,"created_at": string,"id": number,"product_id": number,"rating": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_name"?: string,"comment"?: string | null,"created_at"?: string,"id"?: never,"product_id": number,"rating": number,"user_id": string
                  }
                  Update: {
                    "author_name"?: string,"comment"?: string | null,"created_at"?: string,"id"?: never,"product_id"?: number,"rating"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reviews_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"wishlists": {
                  Row: {
                    "created_at": string,"product_id": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"product_id": number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"product_id"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishlists_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlists_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "admin_report":
{ Args: { "p_from": string,"p_to": string }; Returns: Json
                           },
"coupon_discount_for":
{ Args: { "p_coupon": Omit<Database["public"]['Tables']["coupons"]['Row'], Database["public"]['Tables']["coupons"]['ComputedFields']>,"p_subtotal": number }; Returns: number
                           },
"discounted_price":
{ Args: { "p_percent": number,"p_price": number }; Returns: number
                           },
"get_order_by_id":
{ Args: { "p_order_id": string }; Returns: Json
                           },
"has_purchased":
{ Args: { "p_product_id": number }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"normalize_search":
{ Args: { "p_text": string }; Returns: string
                           },
"place_order":
{ Args: { "p_address": string,"p_city_id": number,"p_coupon_code"?: string,"p_customer_name": string,"p_items": Json,"p_notes"?: string,"p_payment_method": Database["public"]['Enums']["payment_method"],"p_phone": string }; Returns: Json
                           },
"search_products":
{ Args: { "p_limit"?: number,"p_query": string }; Returns: {
              "brand_id": number | null,
"category_id": number | null,
"cost_price": number | null,
"created_at": string,
"description": string | null,
"discount_percent": number,
"id": number,
"is_active": boolean,
"is_featured": boolean,
"name": string,
"offer_ends_at": string | null,
"price": number,
"rating_avg": number,
"rating_count": number,
"sale_price": number | null,
"search_text": string | null,
"sku": string | null,
"slug": string,
"sold_count": number,
"specs": NonNullable<Json>,
"stock": number,
"updated_at": string,
"warranty_months": number
            }[]
                          SetofOptions: {
        from: "*"
        to: "products"
        isOneToOne: false
        isSetofReturn: true
      } },
"track_order":
{ Args: { "p_order_number": string,"p_phone": string }; Returns: Json
                           },
"validate_coupon":
{ Args: { "p_code": string,"p_subtotal": number }; Returns: Json
                           }
          }
          Enums: {
            "coupon_type": "percent"|"fixed","order_status": "pending"|"confirmed"|"processing"|"shipped"|"delivered"|"cancelled","payment_method": "cash"|"bank_transfer"|"onepay"|"lypay","user_role": "customer"|"admin"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "coupon_type": ["percent", "fixed"],"order_status": ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],"payment_method": ["cash", "bank_transfer", "onepay", "lypay"],"user_role": ["customer", "admin"]
          }
        }
} as const
