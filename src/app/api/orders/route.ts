import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      address_id,
      items,
      subtotal,
      shipping_charge,
      total_amount,
      payment_method,
    } = body;

    // Insert Order
    const { data: order, error: orderError } = await (supabase
      .from("orders") as any)
      .insert({
        user_id: user.id,
        address_id,
        subtotal,
        shipping_charge,
        total_amount,
        payment_method: payment_method || "cod",
        payment_status: "pending",
        order_status: "confirmed",
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert Order Items
    const orderItemsPayload = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await (supabase.from("order_items") as any).insert(orderItemsPayload);

    // Clear DB Cart
    await (supabase.from("cart_items") as any).delete().eq("user_id", user.id);

    // Trigger Order Confirmation Email
    const { data: profile } = await (supabase
      .from("profiles") as any)
      .select("full_name")
      .eq("id", user.id)
      .single();

    await sendOrderConfirmationEmail(
      user.email || "",
      profile?.full_name || "Valued Customer",
      order.id,
      total_amount,
      `${items.length} items purchased via Cash on Delivery`
    );

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await (supabase
    .from("profiles") as any)
    .select("role")
    .eq("id", user.id)
    .single();

  let query = (supabase
    .from("orders") as any)
    .select("*, order_items(*, products(*)), addresses(*)")
    .order("created_at", { ascending: false });

  if (!profile || profile.role !== "admin") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data });
}
