<?php

namespace App\Http\Controllers\Api;

use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ReferenceController extends ApiController
{
    public function references(Request $request): JsonResponse
    {
        $kind = $request->route('kind');

        return response()->json(['data' => DB::table($kind)->orderBy('name')->get()]);
    }

    public function saveReference(Request $request): JsonResponse
    {
        $kind = $request->route('kind');
        $id = $request->route('id');
        $rules = ['name' => 'required|string|max:200', 'code' => ['nullable', 'string', 'max:50', Rule::unique($kind)->ignore($id)]];
        $rules += $kind === 'suppliers' ? ['email' => 'nullable|email', 'phone' => 'nullable|string|max:50', 'address' => 'nullable|string|max:500',
            'contact_person' => 'nullable|string|max:200', 'payment_terms' => 'nullable|string|max:200'] : ['description' => 'nullable|string|max:500'];
        $data = $request->validate($rules);
        if ($id) {
            abort_unless(DB::table($kind)->where('id', $id)->exists(), 404);
            DB::table($kind)->where('id', $id)->update([...$data, 'updated_at' => now()]);
        } else {
            $id = DB::table($kind)->insertGetId([...$data, 'created_at' => now(), 'updated_at' => now()]);
        }
        $this->audit($request, 'Reference saved', $data['name'].' saved.');

        return response()->json(['data' => DB::table($kind)->find($id)]);
    }

    public function deleteReference(Request $request): JsonResponse
    {
        $kind = $request->route('kind');
        $id = $request->route('id');
        abort_unless(DB::table($kind)->where('id', $id)->exists(), 404);
        $used = $kind === 'categories' ? Item::where('category_id', $id)->exists() : DB::table('purchase_orders')->where('supplier_id', $id)->exists();
        abort_if($used, 422, 'This record has linked history and must be retained.');
        DB::table($kind)->where('id', $id)->delete();
        $this->audit($request, 'Reference removed', $kind.' record '.$id.' removed.');

        return response()->json(['message' => 'Record removed.']);
    }
}
