import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");

  const supabase = await createClient();

  let query = (supabase
    .from("products") as any)
    .select("*, product_images(*), categories(*)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (category) {
    query = query.eq("category_id", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify Admin Role
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

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Admin role required" }, { status: 403 });
  }

  const body = await request.json();

  const { data, error } = await (supabase
    .from("products") as any)
    .insert({
      id: body.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      offer_price: body.offer_price,
      stock: body.stock || 50,
      featured: body.featured || false,
      status: body.status || "active",
      category_id: body.category_id,
      benefits: body.benefits || [],
      ingredients: body.ingredients,
      usage_instructions: body.usage_instructions,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: data });
}
